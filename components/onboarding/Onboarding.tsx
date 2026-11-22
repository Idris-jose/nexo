"use client";
import { ArrowRight, Briefcase, Check, ChevronDown, ChevronLeft, MapPin, Smartphone, User as UserIcon, Wrench } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signup } from "@/lib/demo/actions";
import { DEMO_ACCOUNTS, DEMO_LOGIN_OTP } from "@/lib/demo/constants";
import { AREA_KEYS, area } from "@/lib/demo/geo";
import { homeFor, login } from "@/lib/demo/session";
import { SERVICES } from "@/lib/demo/services";
import { getState, useStore } from "@/lib/demo/store";
import type { User } from "@/lib/demo/types";
import { Avatar, FieldError, OtpInput, Splash, Toaster, cx, splashKey, toast } from "@/components/ui";

type Step = "phone" | "otp" | "profile";
const pretty = (p: string) => p.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");

/** Figma onboarding 9.1 to 9.4 (phone, OTP, complete profile), with the live sign-in logic. */
export function Onboarding() {
  const next = useSearchParams().get("next");
  const s = useStore();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string>();
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(30);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"requestor" | "vendor">("requestor");
  const [service, setService] = useState("repairs");
  const [areaKey, setAreaKey] = useState("");
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  const existing = s.users.find((u) => u.phone === digits);

  useEffect(() => {
    if (step !== "otp" || left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [step, left]);

  const finish = (u: User) => {
    login(u.id);
    // The sign-in splash already played; don't replay it as soon as the app opens.
    try { sessionStorage.setItem(splashKey(u.role), "1"); } catch {}
    const home = homeFor(u.role);
    window.location.assign(next && next.startsWith(home.replace(/\/$/, "")) ? next : home);
  };

  const submitPhone = () => {
    if (!/^[6-8]\d{8}$/.test(digits)) return setError("Enter a valid South African mobile number");
    if (existing && existing.status !== "active") return setError("This account is suspended. Contact support.");
    setError(undefined);
    setCode("");
    setLeft(30);
    setStep("otp");
    toast(`Demo code sent: ${DEMO_LOGIN_OTP}`);
  };

  const verify = (c = code) => {
    if (c !== DEMO_LOGIN_OTP) {
      setError(`That code doesn't match. In the demo it's ${DEMO_LOGIN_OTP}.`);
      setCode("");
      return;
    }
    setError(undefined);
    if (existing) finish(existing);
    else setStep("profile");
  };

  const create = () => {
    if (name.trim().split(/\s+/).length < 2) return setError("Enter your first and last name");
    if (!areaKey) return setError("Select your area");
    setError(undefined);
    const id = signup(digits, name, role, role === "vendor" ? service : undefined, areaKey);
    finish(getState().users.find((u) => u.id === id)!);
  };

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <Splash id="login" />
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col px-5 pb-6 pt-8">
        {step === "phone" && (
          <div className="animate-rise">
            <h1 className="font-display text-[30px] font-bold leading-tight">Welcome to NEXO®.</h1>
            <p className="mt-2 text-[15px] text-muted">Let’s get things done. Sign in or create an account with your mobile number.</p>
            <label htmlFor="phone" className="mb-2 mt-5 block text-[13px] font-semibold">Mobile number</label>
            <div className="flex gap-2.5">
              <div className="relative">
                <select aria-label="Country code" className="h-12 appearance-none rounded-xl border border-line bg-white pl-4 pr-9 text-[15px] font-semibold outline-none">
                  <option>ZA +27</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <input
                id="phone"
                inputMode="tel"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/[^\d ]/g, "").slice(0, 12)); setError(undefined); }}
                onKeyDown={(e) => e.key === "Enter" && submitPhone()}
                placeholder="82 123 4567"
                aria-invalid={!!error}
                className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-[15px] outline-none focus:border-primary"
              />
            </div>
            {error && <FieldError>{error}</FieldError>}
            <PrimaryButton className="mt-4" onClick={submitPhone}>Continue <ArrowRight size={18} /></PrimaryButton>
            <div className="my-4 flex items-center gap-3 text-[13px] text-muted"><span className="h-px flex-1 bg-line" />or continue with<span className="h-px flex-1 bg-line" /></div>
            <OutlineButton icon={<GoogleLogo />} onClick={() => toast("Google sign-in launches with the Supabase backend")}>Continue with Google</OutlineButton>
            <OutlineButton icon={<AppleLogo />} className="mt-3" onClick={() => toast("Apple sign-in launches with the Supabase backend")}>Continue with Apple</OutlineButton>
            <p className="mt-4 text-center text-xs text-muted">By continuing you agree to our <a href="/terms/" className="underline">Terms &amp; Privacy Policy</a>.</p>

            <div className="mt-8">
              <p className="text-[13px] font-semibold">Demo accounts</p>
              <p className="mb-3 text-xs text-muted">Try NEXO® as anyone. One tap signs you in, or type the number above and use code {DEMO_LOGIN_OTP}.</p>
              <div className="space-y-2.5">
                {DEMO_ACCOUNTS.map((a) => {
                  const u = s.users.find((x) => x.id === a.id);
                  if (!u) return null;
                  return (
                    <button key={a.id} type="button" onClick={() => finish(u)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition hover:border-primary/50">
                      <Avatar name={u.name} id={u.id} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold">{u.name} <span className="font-normal text-muted">· {a.label}</span></span>
                        <span className="block text-[13px] text-muted">{a.desc}</span>
                        <span className="mt-1 inline-flex items-center gap-1 font-mono text-[12px] text-primary"><Smartphone size={12} />+27 {a.phone} · OTP {DEMO_LOGIN_OTP}</span>
                      </span>
                      <ArrowRight size={18} className="text-primary" />
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted">Demo data lives in your browser only. <a href="/preview/" className="font-semibold text-primary underline">Phone preview</a></p>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="flex flex-1 flex-col animate-rise">
            <BackLink onClick={() => { setStep("phone"); setError(undefined); }}>Change number</BackLink>
            <h1 className="mt-6 font-display text-[30px] font-bold leading-tight">Enter OTP</h1>
            <p className="mt-2 text-[15px] text-muted">We’ve sent a 6-digit code to +27 {pretty(digits)}</p>
            <div className="mt-6">
              <OtpInput value={code} invalid={!!error} onChange={(c) => { setCode(c); setError(undefined); }} onComplete={verify} />
            </div>
            {error && <div className="flex justify-center"><FieldError>{error}</FieldError></div>}
            <p className="mx-auto mt-4 w-fit rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-semibold text-primary">Demo: the code is {DEMO_LOGIN_OTP}</p>
            <div className="mt-3 text-center text-[13px] text-muted">
              {left > 0 ? (
                <>Resend code in 00:{String(left).padStart(2, "0")}</>
              ) : (
                <button type="button" className="font-semibold text-primary" onClick={() => { setLeft(30); toast(`Demo code sent: ${DEMO_LOGIN_OTP}`); }}>Resend code</button>
              )}
            </div>
            <div className="mt-auto pt-10"><PrimaryButton disabled={code.length !== 6} onClick={() => verify()}>Verify</PrimaryButton></div>
          </div>
        )}

        {step === "profile" && (
          <div className="flex flex-1 flex-col animate-rise">
            <BackLink onClick={() => { setStep("otp"); setError(undefined); }}>Back</BackLink>
            <h1 className="mt-6 font-display text-[30px] font-bold leading-tight">Complete your profile</h1>
            <p className="mt-2 text-[15px] text-muted">No payment details needed. We only ask when you book.</p>
            <label htmlFor="fn" className="mb-2 mt-5 block text-[13px] font-semibold">Full name</label>
            <input id="fn" value={name} onChange={(e) => { setName(e.target.value); setError(undefined); }} placeholder="e.g. Lindiwe Zulu" className="h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] outline-none focus:border-primary" />
            <p className="mb-2 mt-4 text-[13px] font-semibold">How will you use NEXO®?</p>
            <div className="space-y-2.5" role="radiogroup">
              <RoleCard on={role === "requestor"} onClick={() => setRole("requestor")} icon={<UserIcon size={20} />} title="I need a service" body="Post gigs or book verified vendors near you." />
              <RoleCard on={role === "vendor"} onClick={() => setRole("vendor")} icon={<Briefcase size={20} />} title="I provide services" body="Receive gigs, place bids and get paid." />
            </div>
            {role === "vendor" && (
              <>
                <label htmlFor="svc" className="mb-2 mt-4 block text-[13px] font-semibold">Your main service</label>
                <BrandSelect id="svc" icon={<Wrench size={18} />} value={service} onChange={setService}>
                  {SERVICES.map((sv) => <option key={sv.slug} value={sv.slug}>{sv.trade} · {sv.name}</option>)}
                </BrandSelect>
              </>
            )}
            <label htmlFor="ar" className="mb-2 mt-4 block text-[13px] font-semibold">Your area</label>
            <BrandSelect id="ar" icon={<MapPin size={18} />} value={areaKey} onChange={(v) => { setAreaKey(v); setError(undefined); }}>
              <option value="" disabled>Select your area</option>
              {AREA_KEYS.map((k) => <option key={k} value={k}>{area(k).suburb}, {area(k).city}</option>)}
            </BrandSelect>
            {error && <FieldError>{error}</FieldError>}
            <div className="mt-auto pt-10"><PrimaryButton onClick={create}>Create account <ArrowRight size={18} /></PrimaryButton></div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, className }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cx("inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[16px] font-semibold text-white transition hover:bg-primary-dark active:scale-[.98] disabled:opacity-50", className)}>
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, className, icon }: { children: ReactNode; onClick: () => void; className?: string; icon?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cx("inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white text-[15px] font-semibold transition hover:border-primary/50", className)}>
      {icon}
      {children}
    </button>
  );
}

/** Google "G" mark (brand colours). */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Apple mark. */
function AppleLogo() {
  return (
    <svg width="18" height="20" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function BackLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 self-start text-[15px] font-semibold">
      <ChevronLeft size={18} className="text-primary" /> {children}
    </button>
  );
}

function RoleCard({ on, onClick, icon, title, body }: { on: boolean; onClick: () => void; icon: ReactNode; title: string; body: string }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={cx("flex w-full items-center gap-3 rounded-2xl border bg-white p-3.5 text-left transition", on ? "border-2 border-primary" : "border-line")}>
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold">{title}</span>
        <span className="block text-[13px] text-muted">{body}</span>
      </span>
      <span className={cx("inline-flex size-6 shrink-0 items-center justify-center rounded-full border", on ? "border-primary bg-primary text-white" : "border-line")}>{on && <Check size={14} strokeWidth={3} />}</span>
    </button>
  );
}

function BrandSelect({ id, icon, value, onChange, children }: { id: string; icon: ReactNode; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cx("h-12 w-full appearance-none rounded-xl border border-line bg-white pl-11 pr-10 text-[15px] outline-none focus:border-primary", !value && "text-muted")}>
        {children}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
    </div>
  );
}
