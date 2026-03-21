import type { NextAuthConfig } from "next-auth";

const fallbackSecret = process.env.NODE_ENV === "production" ? undefined : "crafter-admin-dev-secret";
const runtimeSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? fallbackSecret;

if (!runtimeSecret) {
  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required for the admin panel deployment.");
}

export const authConfig: NextAuthConfig = {
  // Prefer explicit secrets via AUTH_SECRET or NEXTAUTH_SECRET. We only fall back
  // to a static dev secret in non-production environments so that the prod
  // build fails fast when those secrets are missing.
  secret: runtimeSecret,
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
