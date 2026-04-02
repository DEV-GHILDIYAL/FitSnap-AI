import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== "ghildiyaldev1325@gmail.com") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 403 });
    }

    const { Items = [] } = await dynamoDb.send(new ScanCommand({ TableName: "users" }));
    
    // Sort by createdAt descending
    const sortedUsers = Items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return NextResponse.json({ users: sortedUsers });

  } catch (error) {
    console.error("[AdminUsers] Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch user list" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== "ghildiyaldev1325@gmail.com") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    // Protect the current admin from self-deletion
    if (userId === session.user.email) {
      return NextResponse.json({ error: "You cannot delete yourself." }, { status: 400 });
    }

    await dynamoDb.send(
      new DeleteCommand({
        TableName: "users",
        Key: { userId }
      })
    );

    return NextResponse.json({ success: true, message: `User ${userId} deleted.` });

  } catch (error) {
    console.error("[AdminUsers] Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
