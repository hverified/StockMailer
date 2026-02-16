import { NextResponse } from "next/server";

import authModule from "../../../src/services/auth.service";
import mongodb from "../../../src/config/mongodb";

const { AuthService, SESSION_COOKIE_NAME } = authModule;

export async function ensureDb() {
  await mongodb.connect();
}

export function json(data, init = {}) {
  return NextResponse.json(data, init);
}

export function getErrorResponse(error) {
  const status = error?.statusCode || error?.status || 500;
  const message = error?.message || "Internal Server Error";
  return NextResponse.json(
    { success: false, error: message, statusCode: status },
    { status }
  );
}

export function getCookieOptions(expiresAt) {
  const isProduction = process.env.NODE_ENV === "production";
  const opts = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  };
  if (expiresAt instanceof Date) opts.expires = expiresAt;
  return opts;
}

export async function getCurrentUser(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const authService = new AuthService();
  return authService.getUserFromSessionToken(token);
}

export async function requireUser(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
