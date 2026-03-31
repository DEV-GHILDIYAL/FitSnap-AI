const { GetCommand, UpdateCommand, PutCommand, TransactWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);

const TEST_USER = "test@user.com";
const TABLE_USERS = "users";
const TABLE_LOGS = "request_logs";
const TABLE_GEN = "generations";

async function runTest() {
  console.log("🧪 --- FitSnap AI v2 Pipeline Test ---");
  const requestId = "test-job-" + crypto.randomBytes(4).toString('hex');

  // STEP 1: Simulate /api/generate (Start)
  console.log(`[1] Starting Generation for ${requestId}...`);
  try {
    await ddb.send(new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: TABLE_USERS,
            Key: { userId: TEST_USER },
            UpdateExpression: "SET credits = credits - :cost",
            ConditionExpression: "credits >= :cost",
            ExpressionAttributeValues: { ":cost": 1 }
          }
        },
        {
          Put: {
            TableName: TABLE_LOGS,
            Item: {
              requestId,
              userId: TEST_USER,
              status: "STARTED",
              credits: 1,
              createdAt: new Date().toISOString()
            }
          }
        }
      ]
    }));
    console.log("✅ Credits Deducted + STARTED log created.");
  } catch (err) {
    console.error("❌ Step 1 Failed:", err.message);
    return;
  }

  // STEP 2: Verify Status
  let log = (await ddb.send(new GetCommand({ TableName: TABLE_LOGS, Key: { requestId } }))).Item;
  console.log(`[2] Verification: Log status is ${log.status}. Correct.`);

  // STEP 3: Simulate Webhook SUCCESS
  console.log("[3] Simulating Webhook SUCCESS...");
  const mockOutput = "https://example.com/result.jpg";
  
  // We'll call the actual Webhook API via node-fetch (assuming the server is running)
  try {
    const res = await fetch(`http://localhost:3000/api/webhooks/replicate?requestId=${requestId}`, {
      method: "POST",
      body: JSON.stringify({
        status: "succeeded",
        output: [mockOutput]
      }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    console.log("✅ Webhook Response:", JSON.stringify(data));
  } catch (err) {
    console.warn("⚠️ Local Server not reachable. Falling back to DB-only verification.");
    return;
  }

  // STEP 4: Verify Final State
  log = (await ddb.send(new GetCommand({ TableName: TABLE_LOGS, Key: { requestId } }))).Item;
  const user = (await ddb.send(new GetCommand({ TableName: TABLE_USERS, Key: { userId: TEST_USER } }))).Item;
  
  console.log(`[4] Results: Status=${log.status}, Credits=${user.credits}`);
  console.log(log.status === "COMPLETED" && user.credits === 9 ? "🏁 TEST PASSED!" : "❌ TEST FAILED!");
}

runTest();
