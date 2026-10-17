import React from "react";
import { downloadProjectionCsv } from "../utils/results.js";
const n = (v) => Math.round(v).toLocaleString("en-IN");
export default function FinancialTable({ rows }) {
	return (
		<section className="result-card">
			<div className="section-row">
				<div>
					<h2>25-year financial projection</h2>
					<p className="muted">
						Estimates in nominal rupees; figures may differ due to actual
						tariffs, weather and usage.
					</p>
				</div>
				<button
					type="button"
					className="secondary"
					onClick={() => downloadProjectionCsv(rows)}
				>
					Download CSV
				</button>
			</div>
			<div className="table-scroll financial-table">
				<table>
					<caption>Full 25-year projection by year</caption>
					<thead>
						<tr>
							<th>Year</th>
							<th>Generation (kWh)</th>
							<th>Tariff (₹/kWh)</th>
							<th>Self-consumed (kWh)</th>
							<th>Export (kWh)</th>
							<th>Savings (₹)</th>
							<th>Cumulative (₹)</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r.year}>
								<td>{r.year}</td>
								<td>{n(r.generationKWh)}</td>
								<td>{r.tariff.toFixed(2)}</td>
								<td>{n(r.selfConsumedKWh)}</td>
								<td>{n(r.exportKWh)}</td>
								<td>{n(r.savings)}</td>
								<td>{n(r.cumulativeSavings)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
