import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
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

    // 2. Decode Tier Math (Testing Mode: 1, 2, 3)
    let creditsToAdd = 0;
    if (amount === 1) creditsToAdd = 20;
    else if (amount === 2) creditsToAdd = 50;
    else if (amount === 3) creditsToAdd = 150;
    else creditsToAdd = Math.floor(amount * 20); // Fallback: 20 per rupee for testing

    // 3. Atomically Update DynamoDB Live Credits
    await dynamoDb.send(
      new UpdateCommand({
        TableName: "users",
        Key: { userId: session.user.email },
        UpdateExpression: "SET credits = if_not_exists(credits, :start) + :inc",
        ExpressionAttributeValues: {
          ":inc": creditsToAdd,
          ":start": 0
        },
        ReturnValues: "UPDATED_NEW" // Validates execution pipeline
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
