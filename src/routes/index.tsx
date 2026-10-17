import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { incident } from "@/lib/reach/mock-data";
import { summarizeHouseholds, useHouseholds } from "@/lib/reach/store";
import type { ContactChannel, Household, Status } from "@/lib/reach/types";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUpRight, Check, MessageSquare, Phone, ShieldCheck, UserRound, X } from "lucide-react";
import logo from "@/assets/reach-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REACH — Evacuation Response Coordinator" },
      { name: "description", content: "Two-way evacuation outreach dashboard for a simulated Los Angeles wildfire." },
      { property: "og:title", content: "REACH — Evacuation Response Coordinator" },
      { property: "og:description", content: "Turn one-way emergency alerts into a two-way response loop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const STATUS: Record<Status, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "text-success bg-success-soft" },
  needs_assistance: { label: "Needs Assistance", cls: "text-amber-ink bg-amber-soft" },
  unreachable: { label: "Unreachable", cls: "text-danger bg-danger-soft" },
  pending: { label: "Outreach in progress", cls: "text-info bg-info-soft" },
};

const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
const channelLabel = (channel: ContactChannel | null) => channel === "voice" ? "Voice call" : channel === "sms" ? "SMS" : "—";
const FOLLOWUP_CLASS = "text-amber-ink bg-amber-soft";

function FollowUpFlag() {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${FOLLOWUP_CLASS}`}><UserRound aria-hidden="true" className="h-3 w-3 shrink-0" />Human Follow-Up Required</span>;
}

function Badge({ s }: { s: Status }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[s].cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{STATUS[s].label}</span>;
}

function Dashboard() {
  const { list, dispatch } = useHouseholds();
  const [selId, setSelId] = useState("h2");
  const sel = list.find((h) => h.id === selId) ?? list[0];
  const counts = summarizeHouseholds(list);
  const followups = list.filter((h) => h.humanFollowUpRequired);
  if (!sel) return null;
  const summaries = [
    { label: STATUS.confirmed.label, cls: STATUS.confirmed.cls, value: counts.confirmed },
    { label: STATUS.needs_assistance.label, cls: STATUS.needs_assistance.cls, value: counts.needs_assistance },
    { label: STATUS.unreachable.label, cls: STATUS.unreachable.cls, value: counts.unreachable },
    { label: "Open Human Follow-Ups", cls: FOLLOWUP_CLASS, value: counts.openFollowUps },
  ];

  const act = (h: Household, kind: string) => {
    const m: Record<string, Parameters<typeof dispatch>[0]> = {
      start: { householdId: h.id, channel: "voice", status: "pending", message: `Outbound call placed in ${h.language}.` },
      confirm: { householdId: h.id, channel: "coordinator", status: "confirmed", message: "Coordinator marked household confirmed." },
      assist: { householdId: h.id, channel: "coordinator", status: "needs_assistance", assistanceNeed: h.assistanceNeed ?? "Unspecified", message: "Coordinator marked household as needing assistance." },
      sms: { householdId: h.id, channel: "sms", message: `SMS fallback sent in ${h.language}.` },
      unreach: { householdId: h.id, channel: "coordinator", status: "unreachable", message: "Coordinator marked household unreachable." },
    };
    const ev = m[kind];
    if (ev) dispatch(ev);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-navigation text-navigation-foreground">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-card"><img src={logo} alt="REACH emblem" className="h-9 w-9 shrink-0" /></div>
          <div><h1 className="text-xl font-bold">REACH <span className="font-normal text-navigation-muted">LA</span></h1><p className="text-xs text-navigation-muted">Evacuation response coordinator</p></div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-soft px-3.5 py-1.5 text-xs font-semibold text-amber-ink"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Simulation only</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 lg:p-10">
        <section className="py-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1.5 text-xs font-semibold text-amber-ink"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />Exercise — not a real event</span>
            <span className="text-xs text-muted-foreground">INCIDENT {incident.id.toUpperCase()} · started {time(incident.startedAt)}</span>
          </div>
          <h2 className="mt-4 max-w-4xl text-2xl font-semibold leading-snug sm:text-3xl">{incident.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Fictional households. No real alerts, calls, or dispatches are sent.</p>
        </section>

        <section aria-label="Response summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {summaries.map((s) => (
            <div key={s.label} className="rounded-lg bg-card p-5 shadow-surface sm:p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><span className={`h-2 w-2 shrink-0 rounded-full ${s.cls.replace(/bg-\S+/, "bg-current")}`} />{s.label}</div>
              <div className={`mt-4 text-4xl font-semibold ${s.cls.split(" ")[0]}`}>{s.value}</div>
            </div>
          ))}
        </section>

        {followups.length > 0 && (
          <section className="flex items-start gap-3 border-l-2 border-amber bg-amber-soft px-5 py-4">
            <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-ink" aria-hidden="true" /><div>
            <h3 className="text-sm font-semibold text-amber-ink">Human follow-up required</h3>
            <ul className="mt-1 space-y-1 text-sm leading-relaxed">
              {followups.map((h) => (
                <li key={h.id} className="text-foreground">
                  {h.assistanceNeed ? `${h.name} requested ${h.assistanceNeed.toLowerCase()}.` : `${h.name} requires human follow-up.`} {h.assistanceNeed && !h.dispatched && <strong>Assistance has not been dispatched.</strong>}
                </li>
              ))}
            </ul>
            </div>
          </section>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(440px,1fr)]">
          <section aria-label="Households" className="min-w-0 overflow-hidden rounded-lg bg-card shadow-surface">
            <div className="flex items-center justify-between px-6 py-5"><h3 className="text-base font-semibold">Households</h3><span className="text-xs text-muted-foreground">{list.length} households</span></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
              <thead className="border-y border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>{["Household", "Status / escalation", "Last contact", "Assistance need"].map((c) => <th key={c} scope="col" className="px-5 py-3.5 font-medium">{c}</th>)}</tr>
              </thead>
              <tbody>
                {list.map((h) => (
                  <tr key={h.id} onClick={() => setSelId(h.id)} className={`cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-info-soft/60 ${h.id === selId ? "bg-info-soft/70" : ""}`}>
                    <td className="px-5 py-6"><Button variant="ghost" aria-pressed={h.id === selId} onClick={() => setSelId(h.id)} className="h-auto justify-start whitespace-nowrap p-0 text-left font-semibold hover:bg-transparent hover:text-primary">{h.name}</Button><div className="mt-1.5 text-xs text-muted-foreground">{h.neighborhood}</div><div className="mt-1 text-xs text-muted-foreground">{h.language}</div></td>
                    <td className="px-5 py-6"><div className="flex flex-col items-start gap-2"><Badge s={h.status} />{h.humanFollowUpRequired && <FollowUpFlag />}</div></td>
                    <td className="whitespace-nowrap px-5 py-6"><div className="font-medium">{time(h.lastContactAt)}</div><div className="mt-1.5 text-xs text-muted-foreground">{channelLabel(h.lastChannel)}</div></td>
                    <td className="px-5 py-6 text-xs leading-relaxed">{h.assistanceNeed ?? <span className="text-muted-foreground">None requested</span>}{h.assistanceNeed && !h.dispatched && <span className="mt-1.5 block font-semibold text-amber-ink">Not dispatched</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </section>

          <section aria-label="Household details" className="min-w-0 rounded-lg bg-card p-6 shadow-surface sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Selected household</p><h3 className="text-xl font-semibold">{sel.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{sel.neighborhood}</p>
              </div>
              <Badge s={sel.status} />
            </div>
            {sel.humanFollowUpRequired && <div className="mt-3"><FollowUpFlag /></div>}
            <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
              <div><dt className="text-xs text-muted-foreground">Last channel</dt><dd className="mt-1 font-medium">{channelLabel(sel.lastChannel)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Preferred language</dt><dd className="mt-1 font-medium">{sel.language}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Last contact time</dt><dd className="mt-1 font-mono">{time(sel.lastContactAt)}</dd></div>
            </dl>
            {sel.assistanceNeed && <div className="mt-5 border-l-2 border-amber bg-amber-soft px-4 py-3 text-sm leading-relaxed"><p className="font-semibold text-amber-ink">{sel.assistanceNeed} requested</p><p className="mt-1">{sel.dispatched ? "Assistance dispatched." : "Assistance has not been dispatched."}</p></div>}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button onClick={() => act(sel, "start")} className="col-span-2 h-11 shadow-none"><Phone aria-hidden="true" />Start outreach<ArrowUpRight aria-hidden="true" /></Button>
              <Button variant="outline" onClick={() => act(sel, "sms")} className="col-span-2 h-11 border-primary/20 bg-info-soft text-primary hover:bg-primary/10"><MessageSquare aria-hidden="true" />Send SMS fallback</Button>
              <Button variant="outline" onClick={() => act(sel, "confirm")} className="h-auto min-h-11 whitespace-normal border-border text-success shadow-none hover:bg-success-soft"><Check aria-hidden="true" />Mark confirmed</Button>
              <Button variant="outline" onClick={() => act(sel, "assist")} className="h-auto min-h-11 whitespace-normal border-border text-amber-ink shadow-none hover:bg-amber-soft"><AlertTriangle aria-hidden="true" />Mark needs assistance</Button>
              <Button variant="ghost" onClick={() => act(sel, "unreach")} className="col-span-2 h-10 text-danger hover:bg-danger-soft"><X aria-hidden="true" />Mark unreachable</Button>
            </div>
            <h4 className="mt-6 border-t border-border pt-5 text-sm font-semibold">Communication timeline</h4>
            <ol aria-label="Communication timeline" tabIndex={0} className="mt-4 max-h-96 space-y-5 overflow-y-auto overscroll-contain py-1 pr-2">
              {[...sel.timeline].reverse().map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-info-soft text-primary">{e.channel === "voice" ? <Phone className="h-3.5 w-3.5" aria-hidden="true" /> : e.channel === "sms" ? <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> : <UserRound className="h-3.5 w-3.5" aria-hidden="true" />}</span>
                  <div><div className="text-xs text-muted-foreground">{time(e.at)} · {e.channel === "voice" ? "Voice call" : e.channel === "sms" ? "SMS" : e.channel === "system" ? "System" : "Coordinator"}</div>
                  <div className="mt-1 break-words text-sm leading-relaxed">{e.message}</div></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
