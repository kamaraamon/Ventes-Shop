import { createAuth, resolveOtpSender, toNextJsHandler } from "@vpct/auth";
import { hasDatabaseUrl } from "@vpct/config";
import { createDb } from "@vpct/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json(
    {
      error: "auth_indisponible",
      message: "Better Auth attend DATABASE_URL et BETTER_AUTH_SECRET. Le canal OTP reste à décider.",
    },
    { status: 503 },
  );
}

function bound() {
  if (!hasDatabaseUrl() || !process.env.BETTER_AUTH_SECRET) return null;
  const auth = createAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:43123",
    database: createDb(process.env.DATABASE_URL as string),
    otpSender: resolveOtpSender({ channel: process.env.OTP_CHANNEL }),
  });
  return toNextJsHandler(auth);
}

export function GET(request: Request) {
  const handler = bound();
  if (!handler) return unavailable();
  return handler.GET(request);
}

export function POST(request: Request) {
  const handler = bound();
  if (!handler) return unavailable();
  return handler.POST(request);
}
