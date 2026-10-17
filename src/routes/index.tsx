import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { incident } from "@/lib/reach/mock-data";
import { summarizeHouseholds, useHouseholds } from "@/lib/reach/store";
import type { ContactChannel, Household, Status } from "@/lib/reach/types";
import { Button } from "@/components/ui/button";
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
  confirmed: { label: "Confirmed", cls: "text-success border-outline bg-success/10" },
  needs_assistance: { label: "Needs Assistance", cls: "text-orange border-outline bg-orange/10" },
  unreachable: { label: "Unreachable", cls: "text-danger border-outline bg-danger/10" },
  pending: { label: "Outreach in progress", cls: "text-info border-outline bg-info/10" },
};

const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
const channelLabel = (channel: ContactChannel | null) => channel === "voice" ? "Voice call" : channel === "sms" ? "SMS" : "—";
const FOLLOWUP_CLASS = "text-amber-ink border-outline bg-amber/20";

function FollowUpFlag() {
  return <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${FOLLOWUP_CLASS}`}>Human Follow-Up Required</span>;
}

function Badge({ s }: { s: Status }) {
  return <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${STATUS[s].cls}`}>{STATUS[s].label}</span>;
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
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline bg-card px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <img src={logo} alt="REACH emblem" className="h-10 w-10 shrink-0" />
          <h1 className="text-2xl font-bold tracking-[0.3em]">REACH</h1>
          <span className="text-sm text-muted-foreground">Evacuation response coordinator</span>
        </div>
        <span className="rounded border border-outline bg-amber px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-primary">Simulation only</span>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6">
        <section className="rounded-md border border-outline border-l-4 border-l-danger bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded border border-outline bg-danger px-2 py-0.5 font-mono text-xs font-bold uppercase text-primary-foreground">Exercise — not a real event</span>
            <span className="font-mono text-xs text-muted-foreground">INCIDENT {incident.id.toUpperCase()} · started {time(incident.startedAt)}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold">{incident.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fictional households. No real alerts, calls, or dispatches are sent.</p>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {summaries.map((s) => (
            <div key={s.label} className={`rounded-md border p-4 ${s.cls}`}>
              <div className="text-xs font-medium uppercase tracking-wider">{s.label}</div>
              <div className="mt-2 font-mono text-4xl font-bold">{s.value}</div>
            </div>
          ))}
        </section>

        {followups.length > 0 && (
          <section className="rounded-md border border-outline border-l-4 border-l-amber bg-amber/15 p-5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-ink">Human follow-up required</h3>
            <ul className="mt-2 space-y-1">
              {followups.map((h) => (
                <li key={h.id} className="text-foreground">
                  {h.assistanceNeed ? `${h.name} requested ${h.assistanceNeed.toLowerCase()}.` : `${h.name} requires human follow-up.`} {h.assistanceNeed && !h.dispatched && <strong>Assistance has not been dispatched.</strong>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(420px,1fr)]">
          <section aria-label="Households" className="min-w-0 overflow-x-auto rounded-md border border-outline bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-outline text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>{["Household", "Neighborhood", "Preferred language", "Status / escalation", "Last channel", "Last contact time", "Assistance need"].map((c) => <th key={c} className="px-3 py-3 font-medium">{c}</th>)}</tr>
              </thead>
              <tbody>
                {list.map((h) => (
                  <tr key={h.id} onClick={() => setSelId(h.id)} className={`cursor-pointer border-b border-outline last:border-0 hover:bg-muted ${h.id === selId ? "bg-muted" : ""}`}>
                    <td className="px-4 py-3 font-medium"><Button variant="ghost" onClick={() => setSelId(h.id)} className="h-auto whitespace-normal justify-start p-0 text-left">{h.name}</Button></td>
                    <td className="px-4 py-3">{h.neighborhood}</td>
                    <td className="px-4 py-3">{h.language}</td>
                    <td className="px-4 py-3"><div className="flex flex-col items-start gap-2"><Badge s={h.status} />{h.humanFollowUpRequired && <FollowUpFlag />}</div></td>
                    <td className="whitespace-nowrap px-4 py-3">{channelLabel(h.lastChannel)}</td>
                    <td className="px-4 py-3 font-mono">{time(h.lastContactAt)}</td>
                    <td className="px-4 py-3">{h.assistanceNeed ?? "—"}{h.assistanceNeed && !h.dispatched && <span className="mt-1 block text-xs font-semibold text-orange">Requested · Not dispatched</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-label="Household details" className="min-w-0 rounded-md border border-outline bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{sel.name}</h3>
                <p className="text-sm text-muted-foreground">{sel.neighborhood}</p>
              </div>
              <Badge s={sel.status} />
            </div>
            {sel.humanFollowUpRequired && <div className="mt-3"><FollowUpFlag /></div>}
            <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-outline py-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Last channel</dt><dd className="mt-1 font-medium">{channelLabel(sel.lastChannel)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Preferred language</dt><dd className="mt-1 font-medium">{sel.language}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted-foreground">Last contact time</dt><dd className="mt-1 font-mono">{time(sel.lastContactAt)}</dd></div>
            </dl>
            {sel.assistanceNeed && <div className="mt-4 border-l-4 border-orange bg-orange/10 p-3 text-sm"><p className="font-semibold text-orange">{sel.assistanceNeed} requested</p><p className="mt-1">{sel.dispatched ? "Assistance dispatched." : "Assistance has not been dispatched."}</p></div>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={() => act(sel, "start")} className="col-span-2 border border-outline">Start outreach</Button>
              <Button variant="outline" onClick={() => act(sel, "confirm")} className="h-auto min-h-10 whitespace-normal border-outline text-success hover:bg-success/10">Mark confirmed</Button>
              <Button variant="outline" onClick={() => act(sel, "assist")} className="h-auto min-h-10 whitespace-normal border-outline bg-orange/10 text-orange hover:bg-orange/20">Mark needs assistance</Button>
              <Button variant="outline" onClick={() => act(sel, "sms")} className="h-auto min-h-10 whitespace-normal border-outline hover:bg-muted">Send SMS fallback</Button>
              <Button variant="outline" onClick={() => act(sel, "unreach")} className="h-auto min-h-10 whitespace-normal border-outline text-danger hover:bg-danger/10">Mark unreachable</Button>
            </div>
            <h4 className="mt-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">Communication timeline</h4>
            <ol aria-label="Communication timeline" tabIndex={0} className="mt-3 max-h-96 space-y-3 overflow-y-auto overscroll-contain border-l border-outline py-1 pl-4 pr-2">
              {[...sel.timeline].reverse().map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="font-mono text-xs text-muted-foreground">{time(e.at)} · {e.channel.toUpperCase()}</div>
                  <div className="break-words text-sm">{e.message}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
