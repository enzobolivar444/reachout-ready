import type { Household, Incident } from "./types";

const t = (minAgo: number) => new Date(Date.now() - minAgo * 60000).toISOString();

export const incident: Incident = {
  id: "sim-001",
  title: "Simulated wildfire evacuation — Griffith Park area",
  simulation: true,
  startedAt: t(42),
};

export const households: Household[] = [
  {
    id: "h1", name: "David Kim", neighborhood: "Koreatown", language: "English",
    status: "confirmed", lastContactAt: t(18), assistanceNeed: null, dispatched: false,
    timeline: [
      { id: "e1", at: t(22), channel: "voice", message: "Outbound evacuation call placed." },
      { id: "e2", at: t(18), channel: "voice", message: "Resident confirmed evacuating to a family member's home." },
    ],
  },
  {
    id: "h2", name: "Ana Rivera", neighborhood: "East Hollywood", language: "Spanish",
    status: "human_followup", lastContactAt: t(11), assistanceNeed: "Accessible transportation", dispatched: false,
    timeline: [
      { id: "e3", at: t(15), channel: "voice", message: "Outbound call placed in Spanish." },
      { id: "e4", at: t(11), channel: "voice", message: "Resident requested accessible transportation (wheelchair)." },
      { id: "e5", at: t(10), channel: "system", message: "Escalated to human follow-up." },
    ],
  },
  {
    id: "h3", name: "Jordan Lee", neighborhood: "Los Feliz", language: "English",
    status: "unreachable", lastContactAt: t(6), assistanceNeed: null, dispatched: false,
    timeline: [
      { id: "e6", at: t(20), channel: "voice", message: "Call attempt 1 — no answer." },
      { id: "e7", at: t(13), channel: "voice", message: "Call attempt 2 — voicemail." },
      { id: "e8", at: t(6), channel: "sms", message: "SMS fallback sent. No reply." },
    ],
  },
];
