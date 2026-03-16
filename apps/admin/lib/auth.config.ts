import type { NextAuthConfig } from "next-auth";

const fallbackSecret = process.env.NODE_ENV === "production" ? "crafter-admin-staging-secret" : "crafter-admin-dev-secret";

export const authConfig: NextAuthConfig = {
  // Prefer explicit secrets via AUTH_SECRET or NEXTAUTH_SECRET. For staging/preview
  // environments where this might be missing, we fall back to a static secret so
  // NextAuth doesn't crash with a server configuration error.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? fallbackSecret,
  session: {
    strategy: "jwt"
  },
  trustHost: true,
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