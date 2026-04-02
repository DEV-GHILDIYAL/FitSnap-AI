import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { UpdateCommand, PutCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = body;

    // 1. Core Cryptographic Webhook Validation
    // Validates that this request ACTUALLY came from Razorpay avoiding spoofed credits payload
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ error: "Invalid cryptographic signature. Transaction Spoofing Prevented." }, { status: 400 });
    }

    // 2. Decode Bundle Math (Commercial Production Mode)
    let creditsToAdd = 0;
    const bundleMap = {
      49: 10,       // Micro
      99: 25,       // Starter
      199: 60,      // Standard
      449: 150,     // Value Multiplier
      999: 350,     // Pro Stack
      2199: 800,    // Elite Bulk
      4999: 2000,   // Master Collection
      11999: 5000   // Enterprise Bulk
    };
    creditsToAdd = bundleMap[amount] || Math.floor(amount / 3); // Conservative fallback for manual adjustments

    // 3. Atomic Transaction: Update Credits + Update Revenue + Log Transaction
    const transactionId = `txn_${razorpay_payment_id}`;
    
    await dynamoDb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: "users",
              Key: { userId: session.user.email },
              UpdateExpression: "SET credits = if_not_exists(credits, :start) + :inc, totalPaid = if_not_exists(totalPaid, :start) + :amt",
              ExpressionAttributeValues: {
                ":inc": creditsToAdd,
                ":amt": amount,
                ":start": 0
              }
            }
          },
          {
            Put: {
              TableName: "transactions",
              Item: {
                transactionId,
                userId: session.user.email,
                amount: amount,
                credits: creditsToAdd,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                status: "SUCCESS",
                createdAt: new Date().toISOString()
              }
            }
          }
        ]
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: `Successfully verified and added ${creditsToAdd} credits!` 
    }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json(
      { error: "Internal server error connecting transaction to AWS." },
      { status: 500 }
    );
  }
}
