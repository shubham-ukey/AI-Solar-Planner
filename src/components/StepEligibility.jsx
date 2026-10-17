import React from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eligibilitySchema } from "../utils/schemas.js";
import { useWizard } from "../context/WizardContext.jsx";
import FieldError from "./FieldError.jsx";
const fields = [
	["residential", "nameResidential"],
	["ownerConsent", "ownerConsentQuestion"],
	["validConnection", "validConnectionQuestion"],
	["alreadySubsidised", "alreadySubsidisedQuestion"],
	["aadhaarBankLinked", "aadhaarBankQuestion"],
];
export default function StepEligibility({ onNext }) {
	const { t } = useI18n();
	const { state, dispatch } = useWizard();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(eligibilitySchema),
		defaultValues: state.eligibility,
	});
	const values = watch();
	const blockers = [];
	if (values.residential === "no")
		blockers.push("The scheme checklist requires a residential connection.");
	if (values.ownerConsent === "no")
		blockers.push("Obtain roof-owner consent before proceeding.");
	if (values.validConnection === "no")
		blockers.push("Arrange a valid DISCOM electricity connection first.");
	if (values.alreadySubsidised === "yes")
		blockers.push(
			"The checklist indicates a prior subsidy; verify eligibility with the official portal.",
		);
	if (values.aadhaarBankLinked === "no")
		blockers.push("Link Aadhaar and bank account before applying.");
	return (
		<form
			onSubmit={handleSubmit((v) => {
				dispatch({ type: "PATCH", section: "eligibility", value: v });
				onNext();
			})}
		>
			<h2>{t("eligibilityHeading")}</h2>
			<p className="muted">{t("eligibilityNote")}</p>
			{fields.map(([name, labelKey]) => (
				<fieldset className="field" key={name}>
					<legend>{t(labelKey)}</legend>
					{["yes", "no"].map((opt) => (
						<label className="radio" key={opt}>
							<input
								type="radio"
								value={opt}
								{...register(name)}
								aria-describedby={`${name}-error`}
							/>
							{opt === "yes" ? t("yes") : t("no")}
						</label>
					))}
					<FieldError id={`${name}-error`} error={errors[name]} />
				</fieldset>
			))}
			{blockers.length ? (
				<div className="notice warning" role="status">
					<strong>Eligibility needs attention</strong>
					<ul>
						{blockers.map((x) => (
							<li key={x}>{x}</li>
						))}
					</ul>
					<p>
						You may continue to estimate, but do not treat this as subsidy
						confirmation.
					</p>
				</div>
			) : Object.values(values).every(Boolean) ? (
				<div className="notice success" role="status">
					<strong>Likely eligible</strong> — final eligibility must be verified
					on the official portal.
				</div>
			) : null}
			<p>
				<a href="https://pmsuryaghar.gov.in" target="_blank" rel="noreferrer">
					Official PM Surya Ghar portal (opens in new tab)
				</a>
			</p>
			<div className="actions">
				<button className="primary" type="submit">
					{t("saveContinue")}
				</button>
			</div>
		</form>
	);
}
