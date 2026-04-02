import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      // User: { id, name, email, image }
      if (!user?.email) return false;

      const userId = user.email; // We use email as the consistent Partition Key 'userId'

      try {
        // 1. Check if user already exists
        const result = await dynamoDb.send(
          new GetCommand({
            TableName: "users",
            Key: { userId },
          })
        );

        if (!result.Item) {
          // 2. New User Provisioning
          const isAdmin = user.email === "ghildiyaldev1325@gmail.com";
          await dynamoDb.send(
            new PutCommand({
              TableName: "users",
              Item: {
                userId,
                email: user.email,
                credits: 3, 
                role: isAdmin ? "admin" : "user",
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
              },
            })
          );
          console.info(`[Auth] Provisioned new ${isAdmin ? "admin" : "user"}: ${userId}`);
        } else {
          // 3. Existing User - check for role upgrade (if first time as admin)
          if (user.email === "ghildiyaldev1325@gmail.com" && result.Item.role !== "admin") {
            await dynamoDb.send(
              new UpdateCommand({
                TableName: "users",
                Key: { userId },
                UpdateExpression: "SET #r = :admin, lastActive = :now",
                ExpressionAttributeNames: { "#r": "role" },
                ExpressionAttributeValues: { ":admin": "admin", ":now": new Date().toISOString() },
              })
            );
          } else {
            // Update lastActive anyway
            await dynamoDb.send(
              new UpdateCommand({
                TableName: "users",
                Key: { userId },
                UpdateExpression: "SET lastActive = :now",
                ExpressionAttributeValues: { ":now": new Date().toISOString() },
              })
            );
          }
        }
        return true;
      } catch (err) {
        console.error("[Auth] DynamoDB provision error:", err);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.email; 
        
        // Fetch role from DynamoDB for the session (optional: can also store in JWT for speed)
        const result = await dynamoDb.send(
          new GetCommand({
            TableName: "users",
            Key: { userId: token.email },
          })
        );
        if (result.Item) {
          session.user.role = result.Item.role || "user";
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
