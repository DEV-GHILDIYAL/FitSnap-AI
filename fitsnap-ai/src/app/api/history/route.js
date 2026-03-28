import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;
    
    // Sort Key allows pulling descending historical images
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: "generations",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId,
        },
        ScanIndexForward: false, // Sort descending (newest first)
        Limit: 20 // Cap history retrieval limit per load
      })
    );

    return NextResponse.json({ history: result.Items || [] });
  } catch (err) {
    console.error("[API/History] Fetch Error:", err);
    return NextResponse.json({ error: "Failed to fetch wardrobe history." }, { status: 500 });
  }
}
