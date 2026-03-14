import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "ct_session";

export function getOrCreateSessionId() {
  const current = cookies().get(SESSION_COOKIE)?.value;
  return current ?? randomUUID();
}

export const sessionCookieName = SESSION_COOKIE;