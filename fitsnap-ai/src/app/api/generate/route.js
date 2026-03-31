import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import Replicate from "replicate";
import crypto from "crypto";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MODEL = "cuuupid/idm-vton:e3893af4fb4bd5741752b35b395348c5f7a9ab5c4776264f5d38e41418081ed7";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.email;

    const { userImage, outfitImage, category = "top", gender = "female" } = await request.json();

    if (!userImage || !outfitImage) {
      return NextResponse.json({ error: "Both human and garment images are required." }, { status: 400 });
    }

    const requestId = crypto.randomUUID();
    const cost = 1; // Standard cost

    // 1. Atomic Transaction: Deduct Credits + Create START Log
    try {
      await dynamoDb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: "users",
                Key: { userId },
                UpdateExpression: "SET credits = credits - :cost",
                ConditionExpression: "credits >= :cost",
                ExpressionAttributeValues: { ":cost": cost },
              },
            },
            {
              Put: {
                TableName: "request_logs",
                Item: {
                  requestId,
                  userId,
                  status: "STARTED",
                  credits: cost,
                  createdAt: new Date().toISOString(),
                  expiresAt: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7-day TTL
                },
              },
            },
          ],
        })
      );
    } catch (dbErr) {
      if (dbErr.name === "TransactionCanceledException" || dbErr.message.includes("ConditionalCheckFailed")) {
        return NextResponse.json({ error: "Insufficient Credits" }, { status: 403 });
      }
      throw dbErr;
    }

    // 2. Trigger Replicate with Webhook
    // Note: WEBHOOK_URL must be publicly accessible (use ngrok locally)
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/replicate?requestId=${requestId}`;

    const CATEGORY_MAP = { top: "upper_body", bottom: "lower_body", full: "dresses" };
    const replicateCategory = CATEGORY_MAP[category] || "upper_body";

    // Start the prediction asynchronously
    await replicate.predictions.create({
      model: "cuuupid/idm-vton",
      version: "e3893af4fb4bd5741752b35b395348c5f7a9ab5c4776264f5d38e41418081ed7",
      input: {
        human_img: userImage,
        garm_img: outfitImage,
        garment_des: `high-quality ${gender} ${replicateCategory}`,
        category: replicateCategory,
        crop: true,
      },
      webhook: webhookUrl,
      webhook_events_filter: ["completed"],
    });

    return NextResponse.json({ requestId, status: "STARTED" });

  } catch (err) {
    console.error("Async Generate Error:", err);
    return NextResponse.json({ error: "Failed to start generation" }, { status: 500 });
  }
}
