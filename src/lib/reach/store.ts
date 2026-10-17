import { useCallback, useState } from "react";
import { households as seed } from "./mock-data";
import type { Household, OutreachEvent } from "./types";

/** Pure reducer: apply an outreach event. A Retell webhook would produce the same OutreachEvent. */
export function applyEvent(list: Household[], ev: OutreachEvent): Household[] {
  const at = new Date().toISOString();
  return list.map((h) =>
    h.id !== ev.householdId
      ? h
      : {
          ...h,
          status: ev.status ?? h.status,
          humanFollowUpRequired: ev.humanFollowUpRequired ?? h.humanFollowUpRequired,
          assistanceNeed: ev.assistanceNeed !== undefined ? ev.assistanceNeed : h.assistanceNeed,
          lastContactAt: ev.channel === "voice" || ev.channel === "sms" ? at : h.lastContactAt,
          lastChannel: ev.channel === "voice" || ev.channel === "sms" ? ev.channel : h.lastChannel,
          timeline: [...h.timeline, { id: crypto.randomUUID(), at, channel: ev.channel, message: ev.message }],
        },
  );
}

export function summarizeHouseholds(list: Household[]) {
  return {
    confirmed: list.filter((h) => h.status === "confirmed").length,
    needs_assistance: list.filter((h) => h.status === "needs_assistance").length,
    unreachable: list.filter((h) => h.status === "unreachable").length,
    openFollowUps: list.filter((h) => h.humanFollowUpRequired).length,
  };
}

export function useHouseholds() {
  const [list, setList] = useState<Household[]>(seed);
  const dispatch = useCallback((ev: OutreachEvent) => setList((l) => applyEvent(l, ev)), []);
  return { list, dispatch };
}
