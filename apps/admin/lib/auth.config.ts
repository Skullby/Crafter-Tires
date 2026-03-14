import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers: [],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isPublic = path === "/login" || path.startsWith("/api/auth");

      if (!auth && !isPublic) {
        return false;
      }

      return true;
    }
  }
};