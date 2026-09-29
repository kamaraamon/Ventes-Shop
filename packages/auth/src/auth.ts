import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";
import type { OtpSender } from "./otp";

export interface CreateAuthOptions {
  secret: string;
  baseURL: string;
  database: unknown;
  otpSender: OtpSender;
  schema?: Record<string, unknown>;
}

/**
 * Better Auth + code à usage unique (plugin phone-number).
 * Nécessite DATABASE_URL et BETTER_AUTH_SECRET pour être monté sur une route.
 * Sans base, les écrans de cette itération restent sur les données fictives.
 */
export function createAuth(options: CreateAuthOptions) {
  return betterAuth({
    secret: options.secret,
    baseURL: options.baseURL,
    database: drizzleAdapter(options.database as Parameters<typeof drizzleAdapter>[0], {
      provider: "pg",
      schema: options.schema,
    }),
    plugins: [
      phoneNumber({
        sendOTP: async ({ phoneNumber: to, code }) => {
          await options.otpSender.send({ to, code });
        },
        signUpOnVerification: {
          getTempEmail: (phone) => `${phone.replace(/[^\d]/g, "")}@otp.local`,
          getTempName: (phone) => phone,
        },
      }),
    ],
  });
}
