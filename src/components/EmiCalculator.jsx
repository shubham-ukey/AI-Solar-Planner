import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { calculateEMI } from "../engine/calculations.js";
import { formatINR } from "../utils/formatters.js";
const schema = z.object({
	principal: z.coerce.number().min(0, "Principal must be zero or more."),
	rate: z.coerce
		.number()
		.min(0, "Rate must be zero or more.")
		.max(100, "Rate must be 100% or less."),
	tenure: z.coerce
		.number()
		.int("Tenure must be whole months.")
		.min(1, "Tenure must be at least one month.")
		.max(360, "Tenure cannot exceed 360 months."),
});
export default function EmiCalculator({ netCost, assumptions }) {
	const {
		register,
		watch,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			principal: Math.round(netCost || 0),
			rate: assumptions.annualLoanRate ?? 9,
			tenure: assumptions.loanTenureMonths ?? 120,
		},
		mode: "onChange",
	});
	useEffect(() => {
		reset((v) => ({ ...v, principal: Math.round(netCost || 0) }));
	}, [netCost, reset]);
	const values = watch();
	const valid = schema.safeParse(values);
	const result = valid.success
		? calculateEMI(valid.data.principal, valid.data.rate, valid.data.tenure)
		: null;
	const totalPayment = result ? result.emi * valid.data.tenure : 0;
	return (
		<section className="result-card">
			<h2>EMI calculator</h2>
			<p className="muted">
				Estimate a loan for your net system cost. Edit any value to recalculate.
			</p>
			<form className="emi-form" noValidate>
				<div className="field">
					<label htmlFor="emi-principal">Loan principal (₹)</label>
					<input
						id="emi-principal"
						type="number"
						min="0"
						step="1000"
						{...register("principal")}
					/>
					{errors.principal && (
						<p className="field-error">{errors.principal.message}</p>
					)}
				</div>
				<div className="field">
					<label htmlFor="emi-rate">Annual interest rate (%)</label>
					<input
						id="emi-rate"
						type="number"
						min="0"
						max="100"
						step="0.1"
						{...register("rate")}
					/>
					{errors.rate && <p className="field-error">{errors.rate.message}</p>}
				</div>
				<div className="field">
					<label htmlFor="emi-tenure">Tenure (months)</label>
					<input
						id="emi-tenure"
						type="number"
						min="1"
						max="360"
						step="1"
						{...register("tenure")}
					/>
					{errors.tenure && (
						<p className="field-error">{errors.tenure.message}</p>
					)}
				</div>
			</form>
			{result && (
				<div className="preview-grid emi-results" aria-live="polite">
					<div>
						<span>Monthly EMI</span>
						<strong>{formatINR(result.emi)}</strong>
					</div>
					<div>
						<span>Total interest</span>
						<strong>{formatINR(result.totalInterest)}</strong>
					</div>
					<div>
						<span>Total payment</span>
						<strong>{formatINR(totalPayment)}</strong>
					</div>
				</div>
			)}
		</section>
	);
}
