import { NextResponse } from "next/server";
import { ScanCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

/**
 * GET /api/admin/reaper
 * 
 * Scans for stuck jobs and auto-refunds users.
 * Protect this with a secret key in your .env
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (!process.env.ADMIN_REAPER_SECRET || secret !== process.env.ADMIN_REAPER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // 1. Scan for STUCK jobs (STARTED but older than 10 mins)
    // In actual high-scale production, we would use a Global Secondary Index (GSI) 
    // on 'status' and 'createdAt' to avoid a full table scan.
    const scanResult = await dynamoDb.send(
      new ScanCommand({
        TableName: "request_logs",
        FilterExpression: "#s = :started AND createdAt < :old",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":started": "STARTED", ":old": tenMinutesAgo },
      })
    );

    const stuckJobs = scanResult.Items || [];
    let refundedCount = 0;

    // 2. Atomic Refund each stuck job
    for (const job of stuckJobs) {
      try {
        await dynamoDb.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Update: {
                  TableName: "request_logs",
                  Key: { requestId: job.requestId },
                  UpdateExpression: "SET #s = :expired",
                  ConditionExpression: "#s = :started", // Prevents race if webhook arrives late
                  ExpressionAttributeNames: { "#s": "status" },
                  ExpressionAttributeValues: { ":expired": "EXPIRED", ":started": "STARTED" },
                },
              },
              {
                Update: {
                  TableName: "users",
                  Key: { userId: job.userId },
                  UpdateExpression: "SET credits = credits + :cost",
                  ExpressionAttributeValues: { ":cost": job.credits || 1 },
                },
              },
            ],
          })
        );
        refundedCount++;
      } catch (err) {
        console.error(`Failed to reap job ${job.requestId}:`, err.message);
        // Continue with others
      }
    }

    return NextResponse.json({ 
      success: true, 
      scanned: stuckJobs.length, 
      refunded: refundedCount 
    });

  } catch (error) {
    console.error("Reaper System Error:", error);
    return NextResponse.json({ error: "Reaper failed" }, { status: 500 });
  }
}
