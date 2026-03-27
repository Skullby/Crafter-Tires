import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import type { NextResponse } from "next/server";

const SESSION_COOKIE = "ct_session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function getSessionId(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

export function getOrCreateSessionId() {
  const current = getSessionId();

  if (current) {
    return current;
  }

  const sessionId = randomUUID();
  cookies().set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE
  });

  return sessionId;
}

export function ensureSessionCookie() {
  const store = cookies();
  const current = store.get(SESSION_COOKIE)?.value;

  if (current) {
    return current;
  }

  const sessionId = randomUUID();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE
  });

  return sessionId;
}

export function attachSessionCookie(response: NextResponse) {
  const sessionId = ensureSessionCookie();

  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE
  });

  return response;
}

export const sessionCookieName = SESSION_COOKIE;
