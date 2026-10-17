import React, { useState } from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assumptionsSchema } from "../utils/schemas.js";
import { useWizard } from "../context/WizardContext.jsx";
import assumptionsDefaults from "../config/assumptions.json";
import useSolarPlan from "../hooks/useSolarPlan.js";
import FieldError from "./FieldError.jsx";
const labels = {
	psh: ["Peak sun hours (PSH)", "hours/day"],
	performanceRatio: ["Performance ratio (PR)", "0–1"],
	panelWatt: ["Panel wattage", "W"],
	costPerKW: ["Cost per kW", "₹"],
	tariff: ["Electricity tariff", "₹/unit"],
	exportRate: ["Export rate", "₹/unit"],
	degradationRate: ["Annual panel degradation", "fraction"],
	tariffEscalationRate: ["Annual tariff escalation", "fraction"],
	annualLoanRate: ["Annual loan rate", "%"],
	emissionFactorKgPerKWh: ["Grid emission factor", "kg CO₂/kWh"],
};
function Preview({ plan }) {
	const { t } = useI18n();
	const money = (n) =>
		new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 0,
		}).format(n);
	return (
		<aside className="preview" aria-label="Live solar plan preview">
			<h3>{t("livePreview")}</h3>
			<div className="preview-grid">
				<div>
					<span>System size</span>
					<strong>{plan.systemKW.toFixed(2)} kW</strong>
				</div>
				<div>
					<span>Panels</span>
					<strong>{plan.panelCount}</strong>
				</div>
				<div>
					<span>Annual generation</span>
					<strong>
						{Math.round(plan.annualGenerationKWh).toLocaleString("en-IN")} kWh
					</strong>
				</div>
				<div>
					<span>Total subsidy</span>
					<strong>{money(plan.totalSubsidy)}</strong>
				</div>
			</div>
			{plan.roofLimited && (
				<p className="notice warning">
					Roof limited: consider a larger roof or lower consumption.
				</p>
			)}
			<p className="muted">
				Central subsidy source:{" "}
				<a href={plan.subsidySource} target="_blank" rel="noreferrer">
					official PM Surya Ghar portal
				</a>
			</p>
			<p className="muted">
				Last verified:{" "}
				<strong>{plan.lastVerified || "Not yet verified"}</strong>
			</p>
			<p className="disclaimer">
				Planning estimate only. Final eligibility, subsidy and system design
				depend on official portal rules and a site survey.
			</p>
		</aside>
	);
}
export default function StepAssumptions({ onBack, onFinish }) {
	const { t } = useI18n();
	const { state, dispatch } = useWizard();
	const [inverterText, setInverterText] = useState(
		state.assumptions.standardInverterSizesKW.join(", "),
	);
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(assumptionsSchema),
		defaultValues: state.assumptions,
	});
	const liveAssumptions = watch();
	const plan = useSolarPlan({ ...state, assumptions: liveAssumptions });
	const saveValues = (v) => ({
		...v,
		standardInverterSizesKW: inverterText
			.split(",")
			.map((x) => Number(x.trim()))
			.filter((x) => Number.isFinite(x) && x > 0),
	});
	const goBack = handleSubmit((v) => {
		dispatch({ type: "PATCH", section: "assumptions", value: saveValues(v) });
		onBack();
	});
	return (
		<form
			onSubmit={handleSubmit((v) => {
				dispatch({
					type: "PATCH",
					section: "assumptions",
					value: saveValues(v),
				});
				onFinish();
			})}
		>
			<h2>{t("assumptionsHeading")}</h2>
			<p className="muted">
				Every value below is editable. Items marked “Placeholder” need
				verification before real-world quoting.
			</p>
			<div className="assumption-grid">
				{Object.entries(labels).map(([key, [label, unit]]) => (
					<div className="field" key={key}>
						<label htmlFor={`assume-${key}`}>
							{label} <span className="unit">({unit})</span>
						</label>
						<input
							id={`assume-${key}`}
							type="number"
							step="any"
							{...register(key)}
							aria-describedby={`assume-${key}-error`}
						/>
						<small>
							{[
								"psh",
								"costPerKW",
								"tariff",
								"exportRate",
								"annualLoanRate",
							].includes(key)
								? "Placeholder — editable; verify local/current value."
								: "Default from assumptions.json; editable estimate."}
						</small>
						<FieldError id={`assume-${key}-error`} error={errors[key]} />
					</div>
				))}
			</div>
			<h3 className="subsection-title">Generation and roof factors</h3>
			<div className="assumption-grid">
				{[
					["shadowLossFactors.none", "Shadow loss: none"],
					["shadowLossFactors.low", "Shadow loss: low"],
					["shadowLossFactors.medium", "Shadow loss: medium"],
					["shadowLossFactors.high", "Shadow loss: high"],
					["directionFactors.south", "Direction: south"],
					["directionFactors.south-west", "Direction: south-west"],
					["directionFactors.south-east", "Direction: south-east"],
					["directionFactors.east", "Direction: east"],
					["directionFactors.west", "Direction: west"],
					["directionFactors.north", "Direction: north"],
					["depthOfDischarge.lithium", "Lithium depth of discharge"],
					["depthOfDischarge.leadAcid", "Lead-acid depth of discharge"],
					["roofAreaSqFtPerKW", "Roof area per kW (sq ft)"],
				].map(([key, label]) => (
					<div className="field" key={key}>
						<label htmlFor={`assume-${key}`}>{label}</label>
						<input
							id={`assume-${key}`}
							type="number"
							step="any"
							{...register(key)}
							aria-describedby={`assume-${key}-error`}
						/>
						<small>Editable factor from assumptions.json.</small>
						<FieldError
							id={`assume-${key}-error`}
							error={key.split(".").reduce((obj, k) => obj?.[k], errors)}
						/>
					</div>
				))}
			</div>
			<div className="field">
				<label htmlFor="standardInverterSizesKW">
					Standard inverter sizes (kW, comma-separated)
				</label>
				<input
					id="standardInverterSizesKW"
					value={inverterText}
					onChange={(e) => setInverterText(e.target.value)}
				/>
				<small>
					Current configured values:{" "}
					{state.assumptions.standardInverterSizesKW.join(", ")} kW.
				</small>
			</div>
			<div className="field">
				<label htmlFor="panelDegradationSource">
					Panel degradation source note
				</label>
				<input
					id="panelDegradationSource"
					{...register("panelDegradationSource")}
				/>
			</div>
			<div className="field">
				<label htmlFor="costPerKWSource">Cost per kW source note</label>
				<input id="costPerKWSource" {...register("costPerKWSource")} />
			</div>
			<div className="field">
				<label htmlFor="costPerKWLastVerified">Cost per kW last verified</label>
				<input
					id="costPerKWLastVerified"
					{...register("costPerKWLastVerified")}
				/>
			</div>
			<div className="actions wrap">
				<button
					type="button"
					className="secondary"
					onClick={() => {
						dispatch({ type: "RESET_ASSUMPTIONS" });
						reset({ ...assumptionsDefaults });
						setInverterText(
							assumptionsDefaults.standardInverterSizesKW.join(", "),
						);
					}}
				>
					Reset to defaults
				</button>
				<button type="button" className="secondary" onClick={goBack}>
					{t("back")}
				</button>
				<button className="primary" type="submit">
					{t("finishPlanner")}
				</button>
			</div>
			<Preview plan={plan} />
		</form>
	);
}
