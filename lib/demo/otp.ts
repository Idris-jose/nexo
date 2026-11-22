import { OTP_POLICY } from "./constants";
import type { Otp } from "./types";

export function newCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

export function newOtp(resends = 0): Otp {
  return { code: newCode(), expiresAt: Date.now() + OTP_POLICY.ttlSeconds * 1000, attempts: 0, resends };
}

export type Result = { ok: true } | { ok: false; error: string };

/** Checks (in order): expiry, attempt limit, match. Mutates attempts on mismatch. */
export function checkOtp(otp: Otp, code: string): Result {
  if (Date.now() > otp.expiresAt) return { ok: false, error: "This code has expired. Ask for a new one." };
  if (otp.attempts >= OTP_POLICY.maxAttempts) return { ok: false, error: "Too many attempts. Request a new code." };
  if (otp.code !== code) {
    otp.attempts += 1;
    const left = OTP_POLICY.maxAttempts - otp.attempts;
    return {
      ok: false,
      error: left > 0 ? `That code doesn't match. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many attempts. Request a new code.",
    };
  }
  return { ok: true };
}
