import { NextResponse } from "next/server";
import { GetCommand, UpdateCommand, PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    
    if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

    const body = await request.json();
    const { status, output, error } = body;

    // 1. Get the current log to identify the user and cost
    const logResult = await dynamoDb.send(
      new GetCommand({
        TableName: "request_logs",
        Key: { requestId },
      })
    );
    const log = logResult.Item;
    if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });
    if (log.status !== "STARTED") return NextResponse.json({ error: "Already processed" });

    const userId = log.userId;
    const cost = log.credits || 1;

    // 2. Handle Outcome
    if (status === "succeeded") {
      const resultUrl = Array.isArray(output) ? output[0] : output;
      
      await dynamoDb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: "request_logs",
                Key: { requestId },
                UpdateExpression: "SET #s = :completed, resultUrl = :url",
                ExpressionAttributeNames: { "#s": "status" },
                ExpressionAttributeValues: { ":completed": "COMPLETED", ":url": resultUrl },
              },
            },
            {
              Put: {
                TableName: "generations",
                Item: {
                  userId,
                  createdAt: new Date().toISOString(),
                  resultUrl: resultUrl,
                  requestId: requestId
                },
              },
            },
          ],
        })
      );
    } else {
      // FAILURE / CANCELED / ERROR -> Refund credits
      await dynamoDb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: "request_logs",
                Key: { requestId },
                UpdateExpression: "SET #s = :failed",
                ExpressionAttributeNames: { "#s": "status" },
                ExpressionAttributeValues: { ":failed": "FAILED" },
              },
            },
            {
              Update: {
                TableName: "users",
                Key: { userId },
                UpdateExpression: "SET credits = credits + :cost",
                ExpressionAttributeValues: { ":cost": cost },
              },
            },
          ],
        })
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Webhook Processing Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
