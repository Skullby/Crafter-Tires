import "./load-env";

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

// Cache on global to reuse across hot-reloads (dev) and serverless invocations (prod)
global.prisma = prisma;

export * from "@prisma/client";
export * from "./validation";