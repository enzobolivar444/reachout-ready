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
          assistanceNeed: ev.assistanceNeed !== undefined ? ev.assistanceNeed : h.assistanceNeed,
          lastContactAt: ev.channel === "coordinator" ? h.lastContactAt : at,
          timeline: [...h.timeline, { id: crypto.randomUUID(), at, channel: ev.channel, message: ev.message }],
        },
  );
}

export function useHouseholds() {
  const [list, setList] = useState<Household[]>(seed);
  const dispatch = useCallback((ev: OutreachEvent) => setList((l) => applyEvent(l, ev)), []);
  return { list, dispatch };
}
