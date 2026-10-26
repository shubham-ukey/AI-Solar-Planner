import { describe, it, expect } from "vitest";
import {
	calculateRequiredSystemSize,
	calculateGeneration,
	calculateMonthlySavings,
	calculateCostAndPayback,
	calculate25YearProjection,
	calculateEMI,
} from "../engine/calculations.js";
import { buildProposalData } from "../utils/proposalData.js";
import { createProposalPdf } from "../services/proposalPdf.js";
const assumptions = {
	psh: 4.5,
	performanceRatio: 0.78,
	panelWatt: 540,
	tariff: 7,
	exportRate: 7,
	degradationRate: 0.005,
	tariffEscalationRate: 0.04,
	annualLoanRate: 9,
	costPerKWSource: "Demo only",
	costPerKWLastVerified: "NOT_VERIFIED",
};
const plan = {
	systemKW: 3.24,
	panelCount: 6,
	roofLimited: false,
	roofAreaSqFt: 400,
	annualGenerationKWh: 4050,
	monthlyGenerationKWh: 337.5,
	monthlySavings: 2100,
	totalCost: 194400,
	netCost: 116400,
	paybackYears: 4.62,
	twentyFiveYearNetProfit: 400000,
	roiPercent: 343,
	centralSubsidy: 78000,
	stateSubsidy: 0,
	totalSubsidy: 78000,
	subsidyScheme: "PM Surya Ghar",
	assumptions,
	rows: Array.from({ length: 25 }, (_, i) => ({
		year: i + 1,
		generationKWh: 4050 * 0.995 ** i,
		savings: 25000,
		cumulativeSavings: i * 25000,
	})),
	monthlyUnits: 300,
};
describe("performance smoke benchmarks", () => {
	it("recalculates planner formulas under 200ms after changed inputs", () => {
		const durations = [];
		for (let i = 0; i < 40; i++) {
			const units = 300 + (i % 20);
			const start = performance.now();
			const kw = calculateRequiredSystemSize(units, 4.5, 0.78);
			const gen = calculateGeneration(kw, 4.5, 0.78, "none", "south");
			const sav = calculateMonthlySavings(
				gen.monthlyGenerationKWh,
				units,
				7,
				7,
			);
			calculateCostAndPayback(kw, 60000, 78000, sav.monthlySavings);
			calculate25YearProjection({
				annualGenerationKWh: gen.annualGenerationKWh,
				monthlyUnits: units,
				netCost: kw * 60000,
				years: 25,
			});
			calculateEMI(100000, 9, 120);
			durations.push(performance.now() - start);
		}
		durations.sort((a, b) => a - b);
		expect(durations[Math.floor(durations.length * 0.95)]).toBeLessThan(200);
	});
	it("builds proposal data under 5 seconds", () => {
		const start = performance.now();
		buildProposalData({ proposalId: "SOL-2026-0001", plan });
		expect(performance.now() - start).toBeLessThan(5000);
	});
	it("creates the PDF document under 5 seconds", async () => {
		const start = performance.now();
		const result = await createProposalPdf({
			proposalId: "SOL-2026-0001",
			plan,
		});
		expect(result.filename).toBe("solar-proposal-SOL-2026-0001.pdf");
		expect(result.pdf.getNumberOfPages()).toBeGreaterThan(0);
		expect(performance.now() - start).toBeLessThan(5000);
	});
});
