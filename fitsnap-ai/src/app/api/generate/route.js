import Replicate from "replicate";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

// Ensure AWS SDK forces usage of these environment variables natively or explicitly
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    // Prefix custom so standard Lambda STS doesn't overshadow it
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY || "",
  },
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MODEL = "cuuupid/idm-vton:e3893af4fb4bd5741752b35b395348c5f7a9ab5c4776264f5d38e41418081ed7";

/**
 * POST /api/generate
 *
 * Accepts a JSON body with base64-encoded images:
 *   { userImage: "data:image/...;base64,...", outfitImage: "data:image/...;base64,..." }
 *
 * Calls the Replicate IDM-VTON model and returns the generated image URL.
 */
export async function POST(request) {
  try {
    // --- Validate API token ---
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "your_replicate_api_token_here") {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured. Add it to .env.local" },
        { status: 500 }
      );
    }

    // --- Validate User Authentication ---
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 });
    }
    const userId = session.user.email;

    // --- Validate DynamoDB Credits ---
    const userRecord = await dynamoDb.send(
      new GetCommand({
        TableName: "users",
        Key: { userId },
      })
    );

    if (!userRecord.Item || userRecord.Item.credits <= 0) {
      return NextResponse.json({ error: "No credits left. Please upgrade." }, { status: 403 });
    }

    // --- Parse body ---
    const body = await request.json();
    const { userImage, outfitImage } = body;

    if (!userImage || !outfitImage) {
      return NextResponse.json(
        { error: "Both userImage and outfitImage are required." },
        { status: 400 }
      );
    }

    // --- Call Replicate ---
    console.info(JSON.stringify({ event: "generation_started", timestamp: new Date().toISOString() }));

    const output = await replicate.run(MODEL, {
      input: {
        human_img: userImage,
        garm_img: outfitImage,
        garment_des: "clothing item",
        category: "upper_body",
        steps: 30,
        seed: 42,
      },
    });

    console.info(JSON.stringify({ event: "generation_model_finished", timestamp: new Date().toISOString() }));

    // The model returns a URL string or an array – handle both
    const replicateUrl = Array.isArray(output) ? output[0] : output;

    if (!replicateUrl) {
      console.error(JSON.stringify({ event: "generation_failed", reason: "No output URL from external API." }));
      return NextResponse.json(
        { error: "Model returned no output. Please try again." },
        { status: 502 }
      );
    }
    
    // --- Download and Upload to S3 ---
    let publicS3Url = replicateUrl; // Fallback to replicate URL natively if no S3 config
    if (process.env.S3_BUCKET_NAME) {
      try {
        console.info(JSON.stringify({ event: "s3_upload_started" }));
        const imgResponse = await fetch(replicateUrl);
        const imgBuffer = await imgResponse.arrayBuffer();
        
        const fileName = `generated-outfits/fitsnap-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: Buffer.from(imgBuffer),
            ContentType: "image/jpeg",
            // Depending on bucket config, ACL might throw an error if bucket doesn't support ACLs. 
            // We assume bucket policies allow public read or we're using presigned URLs. 
            // Usually, standard public S3 config without ACL:
            // ACL: "public-read",
          })
        );
        
        // Construct the public URL
        publicS3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
        console.info(JSON.stringify({ event: "s3_upload_success", s3Url: publicS3Url }));
        
      } catch (s3Err) {
        console.error(JSON.stringify({ event: "s3_upload_failed", reason: s3Err.message }));
        // If S3 fails, we can optionally still return the replicate temporary URL
      }
    }

    console.info(JSON.stringify({ event: "generation_success", outputUrl: publicS3Url, timestamp: new Date().toISOString() }));
    
    // --- Deduct Credit on completely successful generation ---
    try {
      await dynamoDb.send(
        new UpdateCommand({
          TableName: "users",
          Key: { userId },
          UpdateExpression: "SET credits = credits - :val",
          ExpressionAttributeValues: {
            ":val": 1,
            ":min": 0,
          },
          ConditionExpression: "credits > :min",
        })
      );
      console.info(`[Credits] Deducted 1 credit for ${userId}`);

      // --- Log Output to History Gallery ---
      await dynamoDb.send(
        new PutCommand({
          TableName: "generations",
          Item: {
            userId,
            createdAt: new Date().toISOString(),
            resultUrl: publicS3Url
            // Optional: outfitImage could be stored here if we want to fetch the "before" mapping.
          }
        })
      );
      console.info(`[History] Logged generation for ${userId}`);

    } catch (dbErr) {
      console.error("[Database] Failed to finalize generation state:", dbErr);
    }

    return NextResponse.json({ resultUrl: publicS3Url });
  } catch (err) {
    console.error(JSON.stringify({ event: "generation_failed", reason: err.message, stack: err.stack }));

    // Replicate-specific error handling
    let message = err?.message || "Something went wrong during outfit generation.";
    const status = err?.response?.status || err?.status || 500;

    if (status === 429 || err?.message?.includes("429")) {
      message = "Server is busy predicting outfits! Rate limit reached. Please wait 10 seconds and try again.";
    } else if (status === 402 || err?.message?.includes("402") || err?.message?.includes("Insufficient credit")) {
      message = "Replicate AI quota exhausted! Your external developer account needs a payment method added to continue generating models.";
    } else if (status === 422) {
      // Append the actual error details from Replicate to help debug
      message = `Invalid input (422): ${err?.message || "Please use a clear, front-facing photo standing straight."}`;
    }

    return NextResponse.json(
      { error: message },
      { status: status === 429 ? 429 : (status === 422 ? 422 : 500) }
    );
  }
}

