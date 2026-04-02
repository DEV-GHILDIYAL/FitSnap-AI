import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== "ghildiyaldev1325@gmail.com") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 403 });
    }

    // 1. Scan for Total Users & Admins & Revenue
    // Optimization Note: In production, use GSIs or Atomic Counters in a 'stats' table.
    const userScan = await dynamoDb.send(new ScanCommand({ TableName: "users" }));
    const users = userScan.Items || [];

    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;
    const totalRevenue = users.reduce((sum, u) => sum + (u.totalPaid || 0), 0);
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const activeNow = users.filter((u) => u.lastActive && u.lastActive > fiveMinutesAgo).length;

    // 2. Scan for Generations Count
    const genScan = await dynamoDb.send(new ScanCommand({ TableName: "request_logs", Select: "COUNT" }));
    const totalGenerations = genScan.Count || 0;

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalRevenue,
      activeNow,
      totalGenerations,
    });

  } catch (error) {
    console.error("[AdminStats] Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
