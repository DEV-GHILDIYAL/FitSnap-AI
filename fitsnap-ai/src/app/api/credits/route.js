import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;
    
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: "users",
        Key: { userId },
      })
    );

    if (!result.Item) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 });
    }

    return NextResponse.json({ credits: result.Item.credits });
  } catch (err) {
    console.error("[API/Credits] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
