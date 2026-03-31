import { NextResponse } from "next/server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = params;

    const result = await dynamoDb.send(
      new GetCommand({
        TableName: "request_logs",
        Key: { requestId },
      })
    );

    const log = result.Item;

    if (!log) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Security: Only owner can check status
    if (log.userId !== session.user.email) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json({
      status: log.status,
      resultUrl: log.resultUrl || null,
      createdAt: log.createdAt,
    });

  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
