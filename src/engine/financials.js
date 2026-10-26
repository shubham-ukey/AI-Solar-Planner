import assumptions from "../config/assumptions.json";
import {
	calculateCostAndPayback,
	calculateEMI,
	calculate25YearProjection,
	calculateCarbonOffset,
} from "./calculations.js";

export function calculateFinancialSummary({
	actualKW,
	totalSubsidy = 0,
	monthlySavings,
	costPerKW = assumptions.costPerKW,
}) {
	return calculateCostAndPayback(
		actualKW,
		costPerKW,
		totalSubsidy,
		monthlySavings,
	);
}
export function calculateLoan(
	principal,
	annualRate = assumptions.annualLoanRate,
	tenureMonths = 120,
) {
	return calculateEMI(principal, annualRate, tenureMonths);
}
export function calculateLifetimeFinancials(input) {
	const projection = calculate25YearProjection(input);
	return {
		...projection,
		co2SavedKgPerYear: calculateCarbonOffset(input.annualGenerationKWh),
	};
}

/** SRS-facing name for the full lifetime projection. */
export function projectLifetime(input) {
	return calculate25YearProjection({ ...input, years: input.years ?? 25 });
}
