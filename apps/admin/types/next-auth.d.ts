import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "ADMIN" | "MANAGER";
    };
  }

  interface User {
    role: "ADMIN" | "MANAGER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "MANAGER";
  }
}
