import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;

    // Lightweight update of purely the timestamp
    await dynamoDb.send(
      new UpdateCommand({
        TableName: "users",
        Key: { userId },
        UpdateExpression: "SET lastActive = :now",
        ExpressionAttributeValues: {
          ":now": new Date().toISOString(),
        },
      })
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[Heartbeat] Update error:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}
