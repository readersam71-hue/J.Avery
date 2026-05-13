import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { teamMembers } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Mock authorization for development
        // In production, use hashed passwords and database lookup
        if (credentials.email === "james@javeryplumbing.co.uk" && credentials.password === "admin") {
          return { id: "1", name: "James Avery", email: "james@javeryplumbing.co.uk", role: "owner" };
        }
        
        const user = await db.query.teamMembers.findFirst({
          where: eq(teamMembers.email, credentials.email as string),
        });

        if (user && credentials.password === "password123") {
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
