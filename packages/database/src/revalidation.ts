import { createHmac, timingSafeEqual } from "node:crypto";

const REVALIDATION_WINDOW_MS = 5 * 60 * 1000;

type RevalidationPayload = {
  scope: string;
  issuedAt: number;
};

function getSecretMaterial() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for revalidation signing");
  }

  return databaseUrl;
}

export function createRevalidationSignature(payload: RevalidationPayload) {
  const body = `${payload.scope}:${payload.issuedAt}`;
  return createHmac("sha256", getSecretMaterial()).update(body).digest("hex");
}

export function verifyRevalidationSignature(payload: RevalidationPayload, signature: string) {
  const expected = createRevalidationSignature(payload);
  const provided = Buffer.from(signature);
  const actual = Buffer.from(expected);

  if (provided.length !== actual.length) {
    return false;
  }

  const age = Math.abs(Date.now() - payload.issuedAt);
  if (age > REVALIDATION_WINDOW_MS) {
    return false;
  }

  return timingSafeEqual(provided, actual);
}
