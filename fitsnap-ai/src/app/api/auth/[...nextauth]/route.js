import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
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
          // 2. New User Provisioning (3 free credits)
          await dynamoDb.send(
            new PutCommand({
              TableName: "users",
              Item: {
                userId,
                email: user.email,
                credits: 3, 
                createdAt: new Date().toISOString(),
              },
            })
          );
          console.info(`[Auth] Provisioned new user: ${userId}`);
        }
        return true;
      } catch (err) {
        console.error("[Auth] DynamoDB provision error:", err);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        // Expose unique stable ID to the session object
        session.user.id = token.email; 
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
