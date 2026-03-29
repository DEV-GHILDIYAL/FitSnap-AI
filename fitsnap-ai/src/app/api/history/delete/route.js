import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.CUSTOM_AWS_REGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const userId = session.user.email;

    // 1. Fetch current history
    const getRes = await dynamoDb.send(
      new GetCommand({
        TableName: "users",
        Key: { userId },
      })
    );

    if (!getRes.Item) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentHistory = getRes.Item.history || [];
    const updatedHistory = currentHistory.filter((item) => item.resultUrl !== url);

    // 2. Update DynamoDB array
    await dynamoDb.send(
      new UpdateCommand({
        TableName: "users",
        Key: { userId },
        UpdateExpression: "SET history = :h",
        ExpressionAttributeValues: {
          ":h": updatedHistory,
        },
      })
    );

    // 3. (Optional Sandbox) Attempt to delete from S3 to save space
    try {
      if (url.includes("amazonaws.com")) {
        const urlObj = new URL(url);
        // Extracts the object key safely parsing typical S3 formats
        const key = urlObj.pathname.slice(1);
        if (key && process.env.S3_BUCKET_NAME) {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: key,
            })
          );
        }
      }
    } catch (e) {
      console.error("S3 Deletion Soft-fail (continuing):", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete History Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
