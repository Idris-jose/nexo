"use client";
import { Bell, MessageCircle, Search, SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { markAllRead, sendMessage } from "@/lib/demo/actions";
import { fmtTime, timeAgo, trade } from "@/lib/demo/format";
import { useStore } from "@/lib/demo/store";
import type { User, Viewer } from "@/lib/demo/types";
import { Avatar, Button, EmptyState, cx } from "@/components/ui";
import { AppBackButton, type Route } from "./router";
import { PageHeader } from "./shell";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime();

/** Figma inbox time: "10:42", "Yesterday", "Mon", "2 Nov". */
function inboxTime(at: number) {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(at)) / 86_400_000);
  if (days <= 0) return fmtTime(at);
  if (days === 1) return "Yesterday";
  const d = new Date(at);
  if (days < 7) return DAYS[d.getDay()];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function dayLabel(at: number) {
  const t = inboxTime(at);
  return t.includes(":") ? "Today" : t;
}

export function NotificationsPage({ user, back }: { user: User; back: string }) {
  const s = useStore();
  const mine = s.notices.filter((n) => n.userId === user.id);
  const unread = mine.filter((n) => !n.read).length;
  return (
    <>
      <PageHeader
        title="Notifications"
        sub={unread ? `${unread} unread` : "You’re all caught up"}
        back={back}
        right={unread ? <Button size="sm" variant="secondary" onClick={() => markAllRead(user.id)}>Mark all read</Button> : undefined}
      />
      {mine.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" body="Updates about your gigs, bids and payments will appear here." />
      ) : (
        <div className="space-y-2.5">
          {mine.map((n) => (
            <a key={n.id} href={n.href ?? "#"} className={cx("flex gap-3 rounded-2xl border bg-white p-4 transition hover:border-primary/40", n.read ? "border-line" : "border-primary/40")}>
              <span className={cx("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", n.tone === "gold" ? "bg-yellow text-[#8a5a00]" : n.tone === "gray" ? "bg-field text-muted" : "bg-primary-soft text-primary")}>
                <Bell size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  {n.title}
                  {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="unread" />}
                </p>
                {n.body && <p className="text-sm text-muted">{n.body}</p>}
                <p className="mt-1 text-[11px] font-medium text-muted/80">{timeAgo(n.at)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export function MessagesPage({ user, route, viewer }: { user: User; route: Route; viewer: Viewer }) {
  const s = useStore();
  const [q, setQ] = useState("");
  const convos = useMemo(
    () =>
      s.gigs
        .filter((g) => g.vendorId && (g.requestorId === user.id || g.vendorId === user.id) && !["bidding", "vendor_selected", "cancelled"].includes(g.status))
        .map((gig) => {
          const msgs = s.messages.filter((m) => m.gigId === gig.id);
          return { gig, last: msgs[msgs.length - 1], other: s.users.find((u) => u.id === (gig.requestorId === user.id ? gig.vendorId : gig.requestorId))! };
        })
        .sort((a, b) => (b.last?.at ?? b.gig.createdAt) - (a.last?.at ?? a.gig.createdAt)),
    [s, user.id],
  );
  const openId = route.parts[1];
  if (openId) {
    const c = convos.find((x) => x.gig.id === openId);
    return c ? (
      <ChatThread gigId={c.gig.id} me={user} other={c.other} viewer={viewer} />
    ) : (
      <EmptyState icon={MessageCircle} title="Conversation not found" action={<Button href="#/messages" variant="secondary">All messages</Button>} />
    );
  }
  const term = q.trim().toLowerCase();
  const shown = convos.filter((c) => !term || c.other.short.toLowerCase().includes(term) || c.gig.title.toLowerCase().includes(term) || c.last?.text.toLowerCase().includes(term));
  return (
    <>
      <PageHeader title="Messages" />
      <label className="relative mb-4 block">
        <span className="sr-only">Search conversations</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="h-12 w-full rounded-xl border border-line bg-field pl-11 pr-4 text-[15px] text-ink outline-none placeholder:text-muted focus:border-primary" />
      </label>
      {convos.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" body="Once a gig is booked you can message each other here." />
      ) : (
        <div className="space-y-2.5">
          {shown.map(({ gig, last, other }) => (
            <a key={gig.id} href={`#/messages/${gig.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 transition hover:border-primary/40">
              <Avatar name={other.name} id={other.id} size={48} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[15px] font-bold text-ink">{other.short}</p>
                  <span className="shrink-0 text-xs text-muted">{last ? inboxTime(last.at) : ""}</span>
                </div>
                <p className="truncate text-[13px] text-muted">{last?.text ?? "Say hello 👋"}</p>
                <p className="truncate text-[11px] font-medium text-primary">{gig.title}</p>
              </div>
            </a>
          ))}
          {shown.length === 0 && <p className="py-6 text-center text-sm text-muted">No conversations match “{q}”.</p>}
        </div>
      )}
    </>
  );
}

export function ChatThread({ gigId, me, other, viewer, embedded }: { gigId: string; me: User; other: User; viewer: Viewer; embedded?: boolean }) {
  const s = useStore();
  const gig = s.gigs.find((g) => g.id === gigId)!;
  const msgs = s.messages.filter((m) => m.gigId === gigId);
  const [text, setText] = useState("");
  const pane = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pane.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);
  const send = () => {
    if (!text.trim()) return;
    sendMessage(gigId, me.id, text);
    setText("");
  };
  const gigHref = viewer === "requestor" ? `#/gig/${gigId}` : `#/job/${gigId}`;
  const subtitle = other.role === "vendor" ? trade(other.service) : "Service Requestor";
  const rows = msgs.map((m, i) => ({ m, sep: i === 0 || dayLabel(msgs[i - 1].at) !== dayLabel(m.at) ? dayLabel(m.at) : null }));
  return (
    <div className={cx("flex flex-col", !embedded && "h-[calc(100dvh-8.5rem)]")}>
      {!embedded && (
        <div className="mb-3 flex items-center gap-3 border-b border-line pb-4">
          <AppBackButton fallback="/messages" />
          <Avatar name={other.name} id={other.id} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-bold text-ink">{other.short}</p>
            <p className="truncate text-[13px] text-muted">{subtitle}</p>
          </div>
          <a href={gigHref} className="shrink-0 rounded-lg bg-primary-soft px-2.5 py-1.5 text-xs font-semibold text-primary">{gig.ref}</a>
        </div>
      )}
      <div ref={pane} className={cx("flex-1 space-y-2.5 overflow-y-auto overscroll-contain", embedded ? "max-h-80 rounded-2xl bg-cream p-3" : "py-1")}>
        {rows.map(({ m, sep }) => {
          return (
            <div key={m.id}>
              {sep && <p className="my-2 text-center text-xs font-semibold text-muted">{sep}</p>}
              {m.fromId === null ? (
                <p className="mx-auto w-fit max-w-[85%] rounded-full bg-primary-soft px-3 py-1.5 text-center text-xs font-medium text-primary-dark">{m.text}</p>
              ) : (
                <div className={cx("flex", m.fromId === me.id ? "justify-end" : "justify-start")}>
                  <div className={cx("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[14.5px]", m.fromId === me.id ? "rounded-br-md bg-ink text-white" : "rounded-bl-md border border-line bg-white text-ink")}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={cx("mt-1 text-right text-[10px]", m.fromId === me.id ? "text-white/70" : "text-muted")}>{fmtTime(m.at)}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor={embedded ? `msg-${gigId}` : "msg"} className="sr-only">Message</label>
        <input id={embedded ? `msg-${gigId}` : "msg"} className="field flex-1 rounded-full" placeholder="Write a message..." autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" aria-label="Send" disabled={!text.trim()} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition disabled:opacity-40">
          <SendHorizontal size={19} />
        </button>
      </form>
    </div>
  );
}
