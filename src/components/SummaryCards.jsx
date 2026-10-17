import React from "react";
import { formatINR, formatKWh, formatKW } from "../utils/formatters.js";
const money = (v) => (v == null ? "Not applicable" : formatINR(v));
export default function SummaryCards({ plan }) {
	const cards = [
		["System size", formatKW(plan.systemKW)],
		[
			"Panels",
			plan.panelCount == null ? "Not available" : `${plan.panelCount} panels`,
		],
		[
			"Required roof area",
			plan.requiredRoofAreaSqFt == null
				? "Not available"
				: `${Math.ceil(plan.requiredRoofAreaSqFt).toLocaleString("en-IN")} sq ft`,
		],
		[
			"Annual generation",
			plan.annualGenerationKWh == null
				? "Not available"
				: formatKWh(plan.annualGenerationKWh),
		],
		["Monthly savings", money(plan.monthlySavings)],
		["Net cost", money(plan.netCost)],
		[
			"Payback period",
			plan.paybackYears == null
				? "No payback with current inputs"
				: `${plan.paybackYears.toFixed(1)} years`,
		],
		["25-year net profit", money(plan.twentyFiveYearNetProfit)],
		[
			"ROI",
			plan.roiPercent == null
				? "Not applicable"
				: `${plan.roiPercent.toFixed(1)}%`,
		],
		[
			"CO₂ saved / year",
			plan.co2SavedKgPerYear == null
				? "Not available"
				: `${Math.round(plan.co2SavedKgPerYear).toLocaleString("en-IN")} kg`,
		],
	];
	return (
		<section aria-labelledby="summary-title">
			<h2 id="summary-title">Your solar plan at a glance</h2>
			<div className="summary-grid">
				{cards.map(([label, value]) => (
					<article className="summary-card" key={label}>
						<span>{label}</span>
						<strong>{value}</strong>
					</article>
				))}
			</div>
			{plan.roofLimited && (
				<p className="notice warning" role="status">
					Roof-limited design: the system has been reduced from{" "}
					{formatKW(plan.requiredKW)} to fit the available roof area.
				</p>
			)}
			{plan.requiredRoofAreaSqFt > plan.roofAreaSqFt && (
				<p className="notice warning" role="alert">
					Panels exceed roof area: estimated required area (
					{Math.ceil(plan.requiredRoofAreaSqFt)} sq ft) is greater than
					available roof area ({plan.roofAreaSqFt} sq ft).
				</p>
			)}
		</section>
	);
}
