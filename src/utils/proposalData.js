import { calculateEMI } from "../engine/calculations.js";
import {
	buildFallbackFaq,
	buildFallbackSummary,
	AI_DISCLAIMER,
} from "./fallbackText.js";
import { guardSummary, summaryNumbersAreSupported } from "./numberGuard.js";
import { formatINR } from "./formatters.js";

export function chooseProposalSummary(aiResult, plan) {
	const fallback = buildFallbackSummary(plan);
	if (
		aiResult?.source === "ai" &&
		typeof aiResult.text === "string" &&
		summaryNumbersAreSupported(aiResult.text, plan)
	)
		return aiResult.text;
	if (
		aiResult?.source === "ai-generated" &&
		typeof aiResult.text === "string" &&
		summaryNumbersAreSupported(aiResult.text, plan)
	)
		return aiResult.text;
	return guardSummary(fallback, plan, fallback) || fallback;
}
export function buildProposalData({
	proposalId,
	date = new Date(),
	customer = {},
	plan,
	aiResult,
	emi = {},
	faqs,
} = {}) {
	if (!plan || !proposalId)
		throw new Error("A computed plan and proposal ID are required.");
	const summary = chooseProposalSummary(aiResult, plan);
	const principal = Math.max(0, Number(plan.netCost || 0));
	const rate = Number(emi.rate ?? plan.assumptions?.annualLoanRate ?? 9);
	const tenure = Number(
		emi.tenure ?? plan.assumptions?.loanTenureMonths ?? 120,
	);
	const loan = calculateEMI(principal, rate, tenure);
	const rows = Array.isArray(plan.rows) ? plan.rows : [];
	const atYear = (year) => rows.find((row) => Number(row.year) === year);
	return {
		proposalId,
		date:
			date instanceof Date
				? date.toISOString().slice(0, 10)
				: String(date).slice(0, 10),
		customer: {
			name: String(customer.name || "Not provided"),
			phone: String(customer.phone || "Not provided"),
			email: String(customer.email || "Not provided"),
			city: String(customer.city || ""),
			state: String(customer.state || ""),
		},
		system: {
			systemKW: plan.systemKW,
			panelCount: plan.panelCount,
			panelWatt: plan.assumptions?.panelWatt,
			roofLimited: Boolean(plan.roofLimited),
			roofAreaSqFt: plan.roofAreaSqFt,
			annualGenerationKWh: plan.annualGenerationKWh,
			monthlyGenerationKWh: plan.monthlyGenerationKWh,
		},
		subsidy: {
			central: plan.centralSubsidy ?? 0,
			state: plan.stateSubsidy ?? 0,
			total: plan.totalSubsidy ?? 0,
			centralScheme: plan.subsidyScheme || "Central subsidy",
			centralSource: plan.subsidySource || "Not supplied",
			centralLastVerified: plan.lastVerified || "Not yet verified",
			stateScheme: plan.stateSubsidyScheme || "State subsidy",
			stateSource: plan.stateSubsidySource || "Not supplied",
			stateLastVerified: plan.stateLastVerified || "Not yet verified",
		},
		cost: {
			totalCost: plan.totalCost,
			netCost: plan.netCost,
			monthlySavings: plan.monthlySavings,
			annualSavings: Number(plan.monthlySavings || 0) * 12,
			paybackYears: plan.paybackYears ?? null,
			twentyFiveYearNetProfit: plan.twentyFiveYearNetProfit,
			roiPercent: plan.roiPercent,
		},
		lifetime: {
			year1: atYear(1) || rows[0] || null,
			year5: atYear(5) || null,
			year10: atYear(10) || null,
			year15: atYear(15) || null,
			year20: atYear(20) || null,
			year25: atYear(25) || rows[rows.length - 1] || null,
			rows,
		},
		emi: {
			principal,
			annualRate: rate,
			tenureMonths: tenure,
			monthlyEmi: loan.emi,
			totalInterest: loan.totalInterest,
			totalPayment: loan.emi * tenure,
		},
		assumptions: {
			psh: plan.assumptions?.psh,
			performanceRatio: plan.assumptions?.performanceRatio,
			tariff: plan.assumptions?.tariff,
			exportRate: plan.assumptions?.exportRate,
			degradationRate: plan.assumptions?.degradationRate,
			tariffEscalationRate: plan.assumptions?.tariffEscalationRate,
			costPerKW: plan.assumptions?.costPerKW,
			costPerKWSource: plan.assumptions?.costPerKWSource,
			costPerKWLastVerified:
				plan.assumptions?.costPerKWLastVerified || "Not yet verified",
			roofAreaSqFtPerKW: plan.assumptions?.roofAreaSqFtPerKW,
		},
		summary,
		faqs:
			Array.isArray(faqs) && faqs.length
				? faqs.slice(0, 8)
				: buildFallbackFaq(plan),
		disclaimer: AI_DISCLAIMER,
		terms:
			"This is an indicative planning estimate, not a binding quotation. Final system design, structural suitability, approvals, subsidy eligibility, tariff, generation and costs depend on site survey and current official rules. Confirm with your DISCOM and installer.",
	};
}
export const proposalMoney = formatINR;
