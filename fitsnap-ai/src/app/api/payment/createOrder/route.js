import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body; 

    // Validate valid predefined active bundles (Testing Mode: 1-8)
    if (amount < 1 || amount > 8) {
      return NextResponse.json({ error: "Invalid credit bundle requested" }, { status: 400 });
    }

    // Initialize Native Razorpay 
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create a tracked transaction ID generated strictly from Indian Banking Nodes
    const options = {
      amount: amount * 100, // Razorpay processes purely in Paise
      currency: "INR",
      receipt: `rcpt_${session.user.email.split("@")[0]}_${Date.now()}`,
      notes: {
        userId: session.user.email,
        tier: amount
      }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate checkout gateway. Check API Keys." },
      { status: 500 }
    );
  }
}
