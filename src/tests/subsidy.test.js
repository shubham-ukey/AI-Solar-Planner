import { describe, it, expect } from "vitest";
import { calculateCentralSubsidy, calculateStateSubsidy, calculateTotalSubsidy } from "../engine/subsidy.js";
import centralConfig from "../config/central_subsidy.json";
import stateConfig from "../config/state_subsidy.json";

describe("Section 6.2 central subsidy", () => {
  it("calculates 1 kW as ₹30,000", () => expect(calculateCentralSubsidy(1)).toBe(30000));
  it("calculates 2 kW as ₹60,000", () => expect(calculateCentralSubsidy(2)).toBe(60000));
  it("applies the SRS fixed ₹78,000 cap to every system above 2 kW", () => {
    expect(calculateCentralSubsidy(2.01)).toBe(78000);
    expect(calculateCentralSubsidy(2.5)).toBe(78000);
    expect(calculateCentralSubsidy(3)).toBe(78000);
    expect(calculateCentralSubsidy(5)).toBe(78000);
  });
  it("returns zero for zero kW", () => expect(calculateCentralSubsidy(0)).toBe(0));
  it("uses passed config values", () => {
    const config = { ...centralConfig, maxSubsidy: 50000 };
    expect(calculateCentralSubsidy(5, config)).toBe(50000);
  });
});

describe("state subsidy", () => {
  it("does not invent an unverified subsidy", () => expect(calculateStateSubsidy(3, "MH", stateConfig).found).toBe(false));
  it("calculates a configured state's subsidy", () => {
    const config = { states: [{ stateCode: "XY", subsidyPerKW: 10000, maxSubsidy: 15000, conditions: "test", lastVerified: "2026-01-01", sourceUrl: "https://example.com" }] };
    expect(calculateStateSubsidy(2, "XY", config).subsidy).toBe(15000);
  });
  it("returns zero for zero kW", () => {
    const config = { states: [{ stateCode: "XY", subsidyPerKW: 10000, maxSubsidy: 15000 }] };
    expect(calculateStateSubsidy(0, "XY", config).subsidy).toBe(0);
  });
});

describe("total subsidy", () => {
  it("adds central and configured state amounts", () => {
    const state = { states: [{ stateCode: "XY", subsidyPerKW: 10000, maxSubsidy: 15000 }] };
    expect(calculateTotalSubsidy(2, "XY", centralConfig, state).totalSubsidy).toBe(75000);
  });
  it("returns central only when state config is absent", () => expect(calculateTotalSubsidy(3, "MH").totalSubsidy).toBe(78000));
  it("returns zero for zero-size system", () => expect(calculateTotalSubsidy(0, "MH").totalSubsidy).toBe(0));
});
