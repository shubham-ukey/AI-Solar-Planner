import React from "react";
import { formatINR } from "../utils/formatters.js";
export default function SubsidyBreakdown({ plan }) {
	return (
		<section className="result-card">
			<h2>Subsidy breakdown</h2>
			<p className="muted">
				Scheme: {plan.subsidyScheme || "Central subsidy scheme"}
			</p>
			<dl className="subsidy-list">
				<div>
					<dt>Central subsidy</dt>
					<dd>{formatINR(plan.centralSubsidy)}</dd>
				</div>
				<div>
					<dt>State subsidy</dt>
					<dd>
						{formatINR(plan.stateSubsidy)}
						{plan.stateSubsidyScheme && plan.stateSubsidy > 0
							? ` · ${plan.stateSubsidyScheme}`
							: ""}
					</dd>
				</div>
				<div className="total">
					<dt>Total subsidy</dt>
					<dd>{formatINR(plan.totalSubsidy)}</dd>
				</div>
			</dl>
			<p>
				Central source:{" "}
				{plan.subsidySource ? (
					<a href={plan.subsidySource} target="_blank" rel="noreferrer">
						Official scheme source
					</a>
				) : (
					"Not provided"
				)}
			</p>
			<p>
				Central last verified:{" "}
				<strong>{plan.lastVerified || "Not yet verified"}</strong>
			</p>
			<p>
				State source:{" "}
				{plan.stateSubsidySource ? (
					<a href={plan.stateSubsidySource} target="_blank" rel="noreferrer">
						State scheme source
					</a>
				) : (
					"No verified state source configured"
				)}
			</p>
			<p>
				State last verified:{" "}
				<strong>{plan.stateLastVerified || "Not yet verified"}</strong>
			</p>
			{plan.systemKW > plan.subsidyLimitKW && (
				<p className="notice warning" role="alert">
					<strong>FR-SB-04:</strong> System size is above the configured subsidy
					limit ({plan.subsidyLimitKW} kW). Confirm eligibility and subsidy
					amount with the official scheme before relying on this estimate.
				</p>
			)}
		</section>
	);
}
