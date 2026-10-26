import { describe, it, expect } from "vitest";
import {
	summaryNumbersAreSupported,
	guardSummary,
} from "../utils/numberGuard.js";
const plan = {
	systemKW: 3,
	netCost: 90000,
	annualGenerationKWh: 4000,
	rows: [{ year: 25 }],
};
describe("AI number guard", () => {
	it("accepts numbers present in computed plan", () =>
		expect(
			summaryNumbersAreSupported("System is 3 kW and costs ₹90,000.", plan),
		).toBe(true));
	it("allows comma formatting and rounding", () =>
		expect(
			summaryNumbersAreSupported("Annual generation is 4,000 kWh.", plan),
		).toBe(true));
	it("rejects invented numbers", () =>
		expect(
			summaryNumbersAreSupported("You will save ₹12,000 monthly.", plan),
		).toBe(false));
	it("returns fallback for unsupported numbers", () =>
		expect(guardSummary("The system saves 12000.", plan, "Safe fallback")).toBe(
			"Safe fallback",
		));
});
