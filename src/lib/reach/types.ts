// Domain types. Shaped so a backend / Retell webhook can later push the same events.
export type Status = "confirmed" | "needs_assistance" | "human_followup" | "unreachable" | "pending";
export type Channel = "voice" | "sms" | "system" | "coordinator";

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  channel: Channel;
  message: string;
}

export interface Household {
  id: string;
  name: string;
  neighborhood: string;
  language: string;
  status: Status;
  lastContactAt: string | null;
  assistanceNeed: string | null;
  dispatched: boolean;
  timeline: TimelineEvent[];
}

export interface Incident {
  id: string;
  title: string;
  simulation: true;
  startedAt: string;
}

/** Shape a future Retell webhook handler would normalize into. */
export interface OutreachEvent {
  householdId: string;
  channel: Channel;
  message: string;
  status?: Status;
  assistanceNeed?: string | null;
}
