import type { Metadata } from "next";
import { Suspense } from "react";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata: Metadata = { title: "Sign in | NEXO®" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-black" />}>
      <Onboarding />
    </Suspense>
  );
}
