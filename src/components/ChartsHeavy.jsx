import React from "react";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ReferenceLine,
} from "recharts";
import { findBreakEvenYear } from "../utils/results.js";
import { formatINR } from "../utils/formatters.js";
export function FinancialChart({ rows, netCost }) {
	const breakEven = findBreakEvenYear(rows, netCost);
	const data = rows.map((r) => ({ ...r, investment: netCost }));
	return (
		<section className="result-card">
			<h2>25-year savings and break-even</h2>
			<p className="chart-summary">
				Cumulative savings are compared with the net upfront cost.{" "}
				{breakEven
					? `Estimated break-even: year ${breakEven}.`
					: "Break-even is not reached within 25 years."}
			</p>
			<div
				className="chart-box"
				role="img"
				aria-label={`Line chart of cumulative savings and net cost over 25 years. ${breakEven ? `Break-even in year ${breakEven}.` : "No break-even within 25 years."}`}
			>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="year" tick={{ fontSize: 11 }} />
						<YAxis
							width={58}
							tick={{ fontSize: 10 }}
							tickFormatter={(v) => `${Math.round(v / 1000)}k`}
						/>
						<Tooltip formatter={(v) => formatINR(v)} />
						<Legend />
						<ReferenceLine y={netCost} stroke="#9a3412" strokeDasharray="4 4" />
						<Line
							type="monotone"
							dataKey="cumulativeSavings"
							name="Cumulative net savings"
							stroke="#176b4d"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="investment"
							name="Net cost"
							stroke="#9a3412"
							strokeDasharray="5 4"
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="table-scroll">
				<table>
					<caption>
						Data table: annual cumulative savings compared with net cost
					</caption>
					<thead>
						<tr>
							<th>Year</th>
							<th>Cumulative savings (₹)</th>
							<th>Net cost (₹)</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r.year}>
								<td>{r.year}</td>
								<td>
									{Math.round(r.cumulativeSavings).toLocaleString("en-IN")}
								</td>
								<td>{Math.round(netCost).toLocaleString("en-IN")}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
export function GenerationChart({ rows, monthlyUnits }) {
	const data = rows.map((r) => ({
		year: r.year,
		generation: Math.round(r.generationKWh),
		consumption: Math.round(monthlyUnits * 12),
	}));
	return (
		<section className="result-card">
			<h2>Generation vs consumption</h2>
			<p className="chart-summary">
				Annual generation declines slightly each year due to panel degradation;
				annual consumption is held at the current estimated level.
			</p>
			<div
				className="chart-box"
				role="img"
				aria-label="Bar chart comparing annual solar generation with annual electricity consumption for each of 25 years."
			>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="year" tick={{ fontSize: 10 }} />
						<YAxis width={55} tick={{ fontSize: 10 }} />
						<Tooltip />
						<Legend />
						<Bar dataKey="generation" name="Generation (kWh)" fill="#176b4d" />
						<Bar
							dataKey="consumption"
							name="Consumption (kWh)"
							fill="#b45309"
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<div className="table-scroll">
				<table>
					<caption>Data table: annual generation and consumption</caption>
					<thead>
						<tr>
							<th>Year</th>
							<th>Generation (kWh)</th>
							<th>Consumption (kWh)</th>
						</tr>
					</thead>
					<tbody>
						{data.map((r) => (
							<tr key={r.year}>
								<td>{r.year}</td>
								<td>{r.generation.toLocaleString("en-IN")}</td>
								<td>{r.consumption.toLocaleString("en-IN")}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
