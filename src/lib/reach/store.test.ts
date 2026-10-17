import { describe, expect, it } from "vitest";
import { households, incident } from "./mock-data";
import { applyEvent, summarizeHouseholds } from "./store";

describe("REACH status rules", () => {
  it("gives Ana a Needs Assistance primary status", () => {
    expect(households.find((h) => h.id === "h2")?.status).toBe("needs_assistance");
  });
  it("tracks Ana's human follow-up independently", () => {
    const result = applyEvent(households, { householdId: "h2", channel: "coordinator", status: "confirmed", message: "Confirmed" });
    expect(result.find((h) => h.id === "h2")?.humanFollowUpRequired).toBe(true);
    expect(result.find((h) => h.id === "h2")?.status).toBe("confirmed");
  });
  it("starts with exactly one in each requested summary", () => {
    expect(summarizeHouseholds(households)).toEqual({ confirmed: 1, needs_assistance: 1, unreachable: 1, openFollowUps: 1 });
  });
  it("keeps accessible transportation requested but not dispatched", () => {
    const ana = households.find((h) => h.id === "h2");
    expect(ana?.assistanceNeed).toBe("Accessible transportation");
    expect(ana?.dispatched).toBe(false);
    const result = applyEvent(households, { householdId: "h2", channel: "sms", message: "Fallback" });
    expect(result.find((h) => h.id === "h2")?.dispatched).toBe(false);
  });
  it("provides communication metadata for all three households", () => {
    expect(households.map((h) => [h.name, h.lastChannel, h.language])).toEqual([
      ["David Kim", "voice", "English"], ["Ana Rivera", "voice", "Spanish"], ["Jordan Lee", "sms", "English"],
    ]);
    expect(households.every((h) => h.lastContactAt && Number.isFinite(Date.parse(h.lastContactAt)))).toBe(true);
  });
  it("does not treat internal escalation as household contact", () => {
    for (const channel of ["system", "coordinator"] as const) {
      const result = applyEvent(households, { householdId: "h2", channel, message: "Escalated" });
      expect(result.find((h) => h.id === "h2")?.lastContactAt).toBe(households.find((h) => h.id === "h2")?.lastContactAt);
      expect(result.find((h) => h.id === "h2")?.lastChannel).toBe("voice");
    }
  });
  it("records SMS fallback as the latest communication channel", () => {
    const result = applyEvent(households, { householdId: "h2", channel: "sms", message: "Fallback" });
    expect(result.find((h) => h.id === "h2")?.lastChannel).toBe("sms");
    expect(result.find((h) => h.id === "h2")?.lastContactAt).not.toBe(households.find((h) => h.id === "h2")?.lastContactAt);
  });
  it("keeps the incident simulation-only", () => {
    expect(incident.simulation).toBe(true);
  });
});