import React, { lazy, Suspense } from "react";
const FinancialHeavy = lazy(() =>
	import("./ChartsHeavy.jsx").then((module) => ({
		default: module.FinancialChart,
	})),
);
const GenerationHeavy = lazy(() =>
	import("./ChartsHeavy.jsx").then((module) => ({
		default: module.GenerationChart,
	})),
);
function LoadingChart() {
	return (
		<section className="result-card">
			<h2>Chart</h2>
			<p role="status">Loading chart…</p>
		</section>
	);
}
export function FinancialChart(props) {
	return (
		<Suspense fallback={<LoadingChart />}>
			<FinancialHeavy {...props} />
		</Suspense>
	);
}
export function GenerationChart(props) {
	return (
		<Suspense fallback={<LoadingChart />}>
			<GenerationHeavy {...props} />
		</Suspense>
	);
}
