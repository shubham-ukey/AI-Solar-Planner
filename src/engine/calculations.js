import assumptions from "../config/assumptions.json";

/** Section 6.1: required size rounded up to the nearest 0.5 kW. */
export function calculateRequiredSystemSize(
	monthlyUnits,
	psh = assumptions.psh,
	pr = assumptions.performanceRatio,
) {
	if (monthlyUnits < 0 || psh <= 0 || pr <= 0)
		throw new RangeError(
			"Units must be non-negative and PSH/PR must be positive.",
		);
	const dailyUnits = monthlyUnits / 30;
	const systemSizeKW = dailyUnits / (psh * pr);
	return Math.ceil(systemSizeKW * 2) / 2;
}

/** Section 6.3: roof capacity limit. */
export function applyRoofCapacityLimit(
	systemSizeKW,
	roofAreaSqFt,
	areaPerKW = assumptions.roofAreaSqFtPerKW,
) {
	if (systemSizeKW < 0 || roofAreaSqFt < 0 || areaPerKW <= 0)
		throw new RangeError(
			"Size/area must be non-negative and areaPerKW positive.",
		);
	const maxKWByRoof = roofAreaSqFt / areaPerKW;
	const finalKW = Math.min(systemSizeKW, maxKWByRoof);
	return { maxKWByRoof, finalKW, roofLimited: finalKW < systemSizeKW };
}

/** Section 6.4: estimate daily/monthly/annual generation. */
export function calculateGeneration(
	kW,
	psh = assumptions.psh,
	pr = assumptions.performanceRatio,
	shadowLevel = "none",
	direction = "south",
	config = assumptions,
) {
	if (kW < 0 || psh < 0 || pr < 0)
		throw new RangeError("kW, PSH and PR must be non-negative.");
	const shadowLossFactor = config.shadowLossFactors[shadowLevel];
	const directionFactor = config.directionFactors[direction];
	if (shadowLossFactor === undefined || directionFactor === undefined)
		throw new RangeError("Unknown shadow level or roof direction.");
	const dailyGenerationKWh =
		kW * psh * pr * (1 - shadowLossFactor) * directionFactor;
	return {
		dailyGenerationKWh,
		monthlyGenerationKWh: dailyGenerationKWh * 30,
		annualGenerationKWh: dailyGenerationKWh * 365,
	};
}

/** Section 6.5: panels, actual installed capacity, and required roof area. */
export function calculatePanels(kW, panelWatt = assumptions.panelWatt) {
	if (kW < 0 || panelWatt <= 0)
		throw new RangeError("kW must be non-negative and panelWatt positive.");
	const panelCount = Math.ceil((kW * 1000) / panelWatt);
	const actualKW = (panelCount * panelWatt) / 1000;
	const requiredAreaSqFt = actualKW * assumptions.roofAreaSqFtPerKW;
	return { panelCount, actualKW, requiredAreaSqFt };
}

/** Suggest an inverter size with 10% margin, rounded up to the next configured standard size. */
export function suggestInverterSize(
	systemKW,
	standardSizes = assumptions.standardInverterSizesKW,
) {
	if (systemKW < 0) throw new RangeError("System size must be non-negative.");
	const target = systemKW * 1.1;
	const sorted = [...standardSizes].sort((a, b) => a - b);
	return sorted.find((size) => size >= target) ?? Math.ceil(target);
}

/** Section 6.6: monthly self-consumption/export split and savings. */
export function calculateMonthlySavings(
	monthlyGenerationKWh,
	monthlyUnits,
	tariff = assumptions.tariff,
	exportRate = assumptions.exportRate,
) {
	if (
		[monthlyGenerationKWh, monthlyUnits, tariff, exportRate].some(
			(value) => value < 0,
		)
	)
		throw new RangeError("Inputs must be non-negative.");
	const selfConsumedKWh = Math.min(monthlyGenerationKWh, monthlyUnits);
	const exportKWh = Math.max(0, monthlyGenerationKWh - monthlyUnits);
	const monthlySavings = selfConsumedKWh * tariff + exportKWh * exportRate;
	return {
		selfConsumedKWh,
		exportKWh,
		monthlySavings,
		annualSavings: monthlySavings * 12,
	};
}

/** Section 6.7: battery capacity and backup inverter. */
export function calculateBattery(
	backupLoadKW,
	backupHours,
	depthOfDischarge = assumptions.depthOfDischarge.lithium,
	peakLoadKW = backupLoadKW,
) {
	if (
		[backupLoadKW, backupHours, peakLoadKW].some((value) => value < 0) ||
		depthOfDischarge <= 0 ||
		depthOfDischarge > 1
	) {
		throw new RangeError(
			"Loads/hours must be non-negative and depth of discharge must be in (0, 1].",
		);
	}
	return {
		batteryKWh: (backupLoadKW * backupHours) / depthOfDischarge,
		inverterKW: peakLoadKW * 1.25,
	};
}

/** Section 6.8: system cost and simple payback. */
export function calculateCostAndPayback(
	actualKW,
	costPerKW = assumptions.costPerKW,
	totalSubsidy = 0,
	monthlySavings = 0,
) {
	if (
		[actualKW, costPerKW, totalSubsidy, monthlySavings].some(
			(value) => value < 0,
		)
	)
		throw new RangeError("Inputs must be non-negative.");
	const totalCost = actualKW * costPerKW;
	const netCost = Math.max(0, totalCost - totalSubsidy);
	const annualSavings = monthlySavings * 12;
	const paybackYears = annualSavings === 0 ? null : netCost / annualSavings;
	return { totalCost, netCost, annualSavings, paybackYears };
}

/** Section 6.9: 25-year projection, retaining Section 6.6 self-consumption/export split. */
export function calculate25YearProjection({
	annualGenerationKWh,
	monthlyUnits,
	tariff = assumptions.tariff,
	exportRate = assumptions.exportRate,
	degradationRate = assumptions.degradationRate,
	escalationRate = assumptions.tariffEscalationRate,
	netCost = 0,
	years = 25,
}) {
	if (
		[
			annualGenerationKWh,
			monthlyUnits,
			tariff,
			exportRate,
			degradationRate,
			escalationRate,
			netCost,
		].some((value) => value < 0) ||
		years < 1
	) {
		throw new RangeError(
			"Projection inputs must be non-negative and years must be >= 1.",
		);
	}
	const annualConsumption = monthlyUnits * 12;
	const rows = [];
	let cumulative = 0;
	for (let year = 1; year <= years; year += 1) {
		const generation =
			annualGenerationKWh * Math.pow(1 - degradationRate, year - 1);
		const yearTariff = tariff * Math.pow(1 + escalationRate, year - 1);
		const selfConsumed = Math.min(generation, annualConsumption);
		const exported = Math.max(0, generation - annualConsumption);
		const savings =
			selfConsumed * yearTariff +
			exported * (exportRate * Math.pow(1 + escalationRate, year - 1));
		cumulative += savings - (year === 1 ? netCost : 0);
		rows.push({
			year,
			generationKWh: generation,
			tariff: yearTariff,
			savings,
			cumulativeSavings: cumulative,
		});
	}
	const twentyFiveYearNetProfit = rows[rows.length - 1].cumulativeSavings;
	const roiPercent =
		netCost === 0 ? 0 : (twentyFiveYearNetProfit / netCost) * 100;
	return { rows, twentyFiveYearNetProfit, roiPercent };
}

/** Section 6.10: EMI and total interest. */
export function calculateEMI(principal, annualRate, tenureMonths) {
	if (principal < 0 || annualRate < 0 || tenureMonths <= 0)
		throw new RangeError(
			"Principal/rate must be non-negative and tenure must be positive.",
		);
	if (principal === 0) return { emi: 0, totalInterest: 0 };
	if (annualRate === 0) {
		const emi = principal / tenureMonths;
		return { emi, totalInterest: 0 };
	}
	const r = annualRate / 12 / 100;
	const n = tenureMonths;
	const factor = Math.pow(1 + r, n);
	const emi = (principal * r * factor) / (factor - 1);
	return { emi, totalInterest: emi * n - principal };
}

/** Section 6.11: annual CO2 offset. */
export function calculateCarbonOffset(
	annualGenerationKWh,
	emissionFactor = assumptions.emissionFactorKgPerKWh,
) {
	if (annualGenerationKWh < 0 || emissionFactor < 0)
		throw new RangeError(
			"Generation and emission factor must be non-negative.",
		);
	return annualGenerationKWh * emissionFactor;
}
