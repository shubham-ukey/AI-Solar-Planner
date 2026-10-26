import { describe, it, expect } from "vitest";
import {
	calculateRequiredSystemSize,
	applyRoofCapacityLimit,
	calculateGeneration,
	calculatePanels,
	suggestInverterSize,
	calculateMonthlySavings,
	calculateBattery,
	calculateCostAndPayback,
	calculate25YearProjection,
	calculateEMI,
	calculateCarbonOffset,
} from "../engine/calculations.js";

describe("Section 6.1 required system size", () => {
	it("rounds the SRS 300-unit example up to 3 kW", () =>
		expect(calculateRequiredSystemSize(300, 4.5, 0.78)).toBe(3));
	it("returns zero for zero units", () =>
		expect(calculateRequiredSystemSize(0)).toBe(0));
	it("rounds up to half-kW steps", () =>
		expect(calculateRequiredSystemSize(100, 4.5, 0.78)).toBe(1));
	it("rejects invalid PSH", () =>
		expect(() => calculateRequiredSystemSize(10, 0, 0.78)).toThrow(RangeError));
});

describe("Section 6.3 roof capacity", () => {
	it("does not limit when roof is large enough", () =>
		expect(applyRoofCapacityLimit(3, 500).roofLimited).toBe(false));
	it("limits system size for a small roof", () =>
		expect(applyRoofCapacityLimit(3, 200).finalKW).toBe(2));
	it("allows zero roof area", () =>
		expect(applyRoofCapacityLimit(3, 0).finalKW).toBe(0));
});

describe("Section 6.4 generation", () => {
	it("calculates standard south-facing generation", () =>
		expect(calculateGeneration(1).dailyGenerationKWh).toBeCloseTo(4.5 * 0.78));
	it("applies high shadow loss", () =>
		expect(
			calculateGeneration(1, 4.5, 0.78, "high", "south").dailyGenerationKWh,
		).toBeCloseTo(4.5 * 0.78 * 0.8));
	it("applies north direction factor", () =>
		expect(
			calculateGeneration(1, 4.5, 0.78, "none", "north").dailyGenerationKWh,
		).toBeCloseTo(4.5 * 0.78 * 0.85));
	it("handles zero kW", () =>
		expect(calculateGeneration(0).annualGenerationKWh).toBe(0));
});

describe("Section 6.5 panels", () => {
	it("ceil-rounds panel count", () =>
		expect(calculatePanels(1, 540).panelCount).toBe(2));
	it("returns zero panels for zero kW", () =>
		expect(calculatePanels(0).panelCount).toBe(0));
	it("supports another panel wattage", () =>
		expect(calculatePanels(1, 500).actualKW).toBe(1));
});

describe("inverter recommendation", () => {
	it("applies 10% margin and next standard size", () =>
		expect(suggestInverterSize(2)).toBe(3));
	it("selects first size for zero", () =>
		expect(suggestInverterSize(0)).toBe(1));
	it("falls back above configured maximum", () =>
		expect(suggestInverterSize(200)).toBe(220));
});

describe("Section 6.6 savings", () => {
	it("uses self-consumption when generation is below usage", () =>
		expect(calculateMonthlySavings(100, 200, 7, 3).monthlySavings).toBe(700));
	it("uses export rate for surplus", () =>
		expect(calculateMonthlySavings(200, 100, 7, 3).monthlySavings).toBe(
			100 * 7 + 100 * 3,
		));
	it("handles zero generation", () =>
		expect(calculateMonthlySavings(0, 100).monthlySavings).toBe(0));
});

describe("Section 6.7 battery", () => {
	it("calculates lithium battery capacity", () =>
		expect(calculateBattery(1, 4, 0.8).batteryKWh).toBe(5));
	it("calculates inverter with 25% margin", () =>
		expect(calculateBattery(1, 2, 0.8, 3).inverterKW).toBe(3.75));
	it("supports lead-acid depth of discharge", () =>
		expect(calculateBattery(1, 2, 0.5).batteryKWh).toBe(4));
});

describe("Section 6.8 cost and payback", () => {
	it("calculates cost, subsidy and payback", () => {
		const result = calculateCostAndPayback(3, 60000, 78000, 3000);
		expect(result.totalCost).toBe(180000);
		expect(result.netCost).toBe(102000);
		expect(result.paybackYears).toBeCloseTo(102000 / 36000);
	});
	it("floors net cost at zero if subsidy exceeds cost", () =>
		expect(calculateCostAndPayback(1, 1000, 5000, 100).netCost).toBe(0));
	it("returns null payback if savings are zero", () =>
		expect(calculateCostAndPayback(1, 60000, 0, 0).paybackYears).toBeNull());
});

describe("Section 6.9 25-year projection", () => {
	it("returns requested number of years", () =>
		expect(
			calculate25YearProjection({
				annualGenerationKWh: 1000,
				monthlyUnits: 100,
				years: 25,
			}).rows,
		).toHaveLength(25));
	it("degrades generation each year", () => {
		const rows = calculate25YearProjection({
			annualGenerationKWh: 1000,
			monthlyUnits: 100,
			years: 3,
		}).rows;
		expect(rows[1].generationKWh).toBeCloseTo(995);
		expect(rows[2].generationKWh).toBeLessThan(rows[1].generationKWh);
	});
	it("handles zero net cost without infinite ROI", () =>
		expect(
			calculate25YearProjection({
				annualGenerationKWh: 0,
				monthlyUnits: 0,
				netCost: 0,
				years: 1,
			}).roiPercent,
		).toBe(0));
});

describe("Section 6.10 EMI", () => {
	it("calculates EMI for a loan", () =>
		expect(calculateEMI(100000, 12, 12).emi).toBeCloseTo(8884.88, 1));
	it("handles zero interest", () =>
		expect(calculateEMI(12000, 0, 12)).toEqual({
			emi: 1000,
			totalInterest: 0,
		}));
	it("handles zero principal", () =>
		expect(calculateEMI(0, 10, 12)).toEqual({ emi: 0, totalInterest: 0 }));
});

describe("Section 6.11 carbon offset", () => {
	it("uses SRS grid emission factor", () =>
		expect(calculateCarbonOffset(1000, 0.82)).toBe(820));
	it("handles zero generation", () => expect(calculateCarbonOffset(0)).toBe(0));
	it("supports an editable factor", () =>
		expect(calculateCarbonOffset(100, 1)).toBe(100));
});
