import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { incident } from "@/lib/reach/mock-data";
import { useHouseholds } from "@/lib/reach/store";
import type { Household, Status } from "@/lib/reach/types";

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
  confirmed: { label: "Confirmed", cls: "text-success border-success/40 bg-success/10" },
  needs_assistance: { label: "Needs Assistance", cls: "text-amber border-amber/40 bg-amber/10" },
  human_followup: { label: "Human Follow-Up", cls: "text-amber border-amber/60 bg-amber/20" },
  unreachable: { label: "Unreachable", cls: "text-danger border-danger/40 bg-danger/10" },
  pending: { label: "Outreach in progress", cls: "text-info border-info/40 bg-info/10" },
};

const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

function Badge({ s }: { s: Status }) {
  return <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${STATUS[s].cls}`}>{STATUS[s].label}</span>;
}

function Dashboard() {
  const { list, dispatch } = useHouseholds();
  const [selId, setSelId] = useState("h2");
  const sel = list.find((h) => h.id === selId)!;
  const count = (s: Status) => list.filter((h) => h.status === s).length;
  const followups = list.filter((h) => h.status === "human_followup" || (h.status === "needs_assistance" && !h.dispatched));

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
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-amber" />
          <h1 className="text-2xl font-bold tracking-[0.3em]">REACH</h1>
          <span className="text-sm text-muted-foreground">Evacuation response coordinator</span>
        </div>
        <span className="rounded border border-amber bg-amber/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-amber">Simulation only</span>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="rounded-md border border-l-4 border-l-danger bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded bg-danger px-2 py-0.5 font-mono text-xs font-bold uppercase text-foreground">Exercise — not a real event</span>
            <span className="font-mono text-xs text-muted-foreground">INCIDENT {incident.id.toUpperCase()} · started {time(incident.startedAt)}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold">{incident.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fictional households. No real alerts, calls, or dispatches are sent.</p>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(["confirmed", "needs_assistance", "human_followup", "unreachable"] as Status[]).map((s) => (
            <div key={s} className={`rounded-md border p-4 ${STATUS[s].cls}`}>
              <div className="text-xs font-medium uppercase tracking-wider">{STATUS[s].label}</div>
              <div className="mt-2 font-mono text-4xl font-bold">{count(s)}</div>
            </div>
          ))}
        </section>

        {followups.length > 0 && (
          <section className="rounded-md border border-amber bg-amber/10 p-5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber">Human follow-up required</h3>
            <ul className="mt-2 space-y-1">
              {followups.map((h) => (
                <li key={h.id} className="text-foreground">
                  {h.name} requested {(h.assistanceNeed ?? "assistance").toLowerCase()}. Assistance has not been dispatched.
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="overflow-x-auto rounded-md border bg-card lg:col-span-2">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>{["Household", "Neighborhood", "Language", "Status", "Last contact", "Assistance need"].map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}</tr>
              </thead>
              <tbody>
                {list.map((h) => (
                  <tr key={h.id} onClick={() => setSelId(h.id)} className={`cursor-pointer border-b last:border-0 hover:bg-muted ${h.id === selId ? "bg-muted" : ""}`}>
                    <td className="px-4 py-3 font-medium">{h.name}</td>
                    <td className="px-4 py-3">{h.neighborhood}</td>
                    <td className="px-4 py-3">{h.language}</td>
                    <td className="px-4 py-3"><Badge s={h.status} /></td>
                    <td className="px-4 py-3 font-mono">{time(h.lastContactAt)}</td>
                    <td className="px-4 py-3">{h.assistanceNeed ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-md border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{sel.name}</h3>
                <p className="text-sm text-muted-foreground">{sel.neighborhood} · {sel.language}</p>
              </div>
              <Badge s={sel.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => act(sel, "start")} className="col-span-2 rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Start outreach</button>
              <button onClick={() => act(sel, "confirm")} className="rounded border border-success/50 px-3 py-2 text-sm text-success hover:bg-success/10">Mark confirmed</button>
              <button onClick={() => act(sel, "assist")} className="rounded border border-amber/50 px-3 py-2 text-sm text-amber hover:bg-amber/10">Mark needs assistance</button>
              <button onClick={() => act(sel, "sms")} className="rounded border px-3 py-2 text-sm hover:bg-muted">Send SMS fallback</button>
              <button onClick={() => act(sel, "unreach")} className="rounded border border-danger/50 px-3 py-2 text-sm text-danger hover:bg-danger/10">Mark unreachable</button>
            </div>
            <h4 className="mt-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">Communication timeline</h4>
            <ol className="mt-3 space-y-3 border-l pl-4">
              {[...sel.timeline].reverse().map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="font-mono text-xs text-muted-foreground">{time(e.at)} · {e.channel.toUpperCase()}</div>
                  <div className="text-sm">{e.message}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
