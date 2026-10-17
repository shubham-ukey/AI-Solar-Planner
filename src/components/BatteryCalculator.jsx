import React, { useState } from "react";
import { calculateBattery } from "../engine/calculations.js";
import { formatKW } from "../utils/formatters.js";
export default function BatteryCalculator({ assumptions }) {
	const [open, setOpen] = useState(false);
	const [load, setLoad] = useState(1);
	const [hours, setHours] = useState(4);
	const [type, setType] = useState("lithium");
	const result = calculateBattery(
		Number(load),
		Number(hours),
		assumptions.depthOfDischarge[type === "lithium" ? "lithium" : "leadAcid"],
		Number(load),
	);
	return (
		<section className="result-card">
			<button
				type="button"
				className="disclosure"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				Optional battery backup estimate <span>{open ? "−" : "+"}</span>
			</button>
			{open && (
				<div>
					<p className="muted">
						Indicative battery sizing only; actual design needs surge-load and
						site checks.
					</p>
					<div className="assumption-grid">
						<div className="field">
							<label htmlFor="backup-load">Backup load (kW)</label>
							<input
								id="backup-load"
								type="number"
								min="0"
								step="0.1"
								value={load}
								onChange={(e) => setLoad(Math.max(0, Number(e.target.value)))}
							/>
						</div>
						<div className="field">
							<label htmlFor="backup-hours">Backup hours</label>
							<input
								id="backup-hours"
								type="number"
								min="0"
								step="1"
								value={hours}
								onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
							/>
						</div>
						<div className="field">
							<label htmlFor="battery-type">Battery type</label>
							<select
								id="battery-type"
								value={type}
								onChange={(e) => setType(e.target.value)}
							>
								<option value="lithium">Lithium</option>
								<option value="lead-acid">Lead-acid</option>
							</select>
						</div>
					</div>
					<div className="preview-grid">
						<div>
							<span>Estimated capacity</span>
							<strong>{result.batteryKWh.toFixed(1)} kWh</strong>
						</div>
						<div>
							<span>Suggested inverter</span>
							<strong>{formatKW(result.inverterKW)}</strong>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
