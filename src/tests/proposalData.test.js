import { describe, it, expect } from "vitest";
import {
	buildProposalData,
	chooseProposalSummary,
} from "../utils/proposalData.js";
import { buildPdfContent } from "../services/proposalPdf.js";
const plan = {
	systemKW: 3,
	panelCount: 6,
	roofLimited: false,
	roofAreaSqFt: 400,
	annualGenerationKWh: 4500,
	monthlyGenerationKWh: 375,
	monthlySavings: 2500,
	totalCost: 180000,
	netCost: 102000,
	paybackYears: 3.4,
	twentyFiveYearNetProfit: 500000,
	roiPercent: 490,
	centralSubsidy: 78000,
	stateSubsidy: 0,
	totalSubsidy: 78000,
	subsidyScheme: "Central scheme",
	subsidySource: "https://example.test",
	lastVerified: null,
	stateSubsidyScheme: "State scheme",
	stateSubsidySource: null,
	stateLastVerified: null,
	assumptions: {
		panelWatt: 540,
		annualLoanRate: 9,
		psh: 4.5,
		performanceRatio: 0.78,
		tariff: 7,
		exportRate: 7,
		degradationRate: 0.005,
		tariffEscalationRate: 0.04,
		costPerKW: 60000,
		costPerKWSource: "SRS placeholder",
		costPerKWLastVerified: "NOT_VERIFIED",
		roofAreaSqFtPerKW: 100,
	},
	rows: Array.from({ length: 25 }, (_, i) => ({
		year: i + 1,
		generationKWh: 4500 - i * 50,
		savings: 30000 + i * 100,
		cumulativeSavings: (i + 1) * 30000 - 102000,
	})),
};
describe("proposal PDF content builder", () => {
	it("builds all required proposal sections from computed plan data", () => {
		const data = buildPdfContent({
			proposalId: "SOL-2026-0001",
			date: new Date("2026-10-17T12:00:00Z"),
			customer: {
				name: "Test Customer",
				phone: "9876543210",
				email: "test@example.com",
			},
			plan,
		});
		expect(data.proposalId).toBe("SOL-2026-0001");
		expect(data.date).toBe("2026-10-17");
		expect(data.customer.name).toBe("Test Customer");
		expect(data.system.systemKW).toBe(3);
		expect(data.subsidy.centralLastVerified).toBe("Not yet verified");
		expect(data.lifetime.rows).toHaveLength(25);
		expect(data.emi.monthlyEmi).toBeGreaterThan(0);
		expect(data.assumptions.costPerKWLastVerified).toBe("NOT_VERIFIED");
		expect(data.disclaimer).toBe(
			"Estimates only. Verify subsidy and tariffs with your DISCOM and installer.",
		);
		expect(data.faqs.length).toBeGreaterThanOrEqual(4);
	});
	it("uses fallback summary when AI summary is missing or contains unsupported numbers", () => {
		expect(chooseProposalSummary(null, plan)).toContain(
			"estimated solar system",
		);
		expect(
			chooseProposalSummary(
				{ source: "ai", text: "Your system will cost ₹999999." },
				plan,
			),
		).not.toContain("999999");
	});
});
