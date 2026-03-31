const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);

async function setup() {
  console.log("🚀 Setting up Test User...");
  try {
    await ddb.send(new PutCommand({
      TableName: "users",
      Item: {
        userId: "test@user.com",
        credits: 10,
        name: "Test Bot"
      }
    }));
    console.log("✅ Test User 'test@user.com' created with 10 credits.");
  } catch (err) {
    console.error("❌ Failed:", err.message);
  }
}

setup();
