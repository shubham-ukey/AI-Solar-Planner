import { describe, it, expect } from "vitest";
import { findBreakEvenYear, formatProjectionCsv } from "../utils/results.js";
describe("results pure helpers", () => {
	it("finds the first non-negative cumulative year", () => {
		expect(
			findBreakEvenYear(
				[
					{ year: 1, cumulativeSavings: 2 },
					{ year: 2, cumulativeSavings: 10 },
					{ year: 3, cumulativeSavings: 15 },
				],
				10,
			),
		).toBe(2);
	});
	it("returns null if break-even is not reached", () => {
		expect(
			findBreakEvenYear([{ year: 1, cumulativeSavings: 5 }], 10),
		).toBeNull();
	});
	it("formats projection rows as CSV", () => {
		expect(
			formatProjectionCsv([
				{
					year: 1,
					generationKWh: 10,
					tariff: 7,
					selfConsumedKWh: 8,
					exportKWh: 2,
					savings: 60,
					cumulativeSavings: 60,
				},
			]),
		).toContain("1.00,10.00,7.00,8.00,2.00,60.00,60.00");
	});
});
