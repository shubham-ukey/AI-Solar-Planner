import React from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { consumptionSchema } from "../utils/schemas.js";
import { useWizard } from "../context/WizardContext.jsx";
import FieldError from "./FieldError.jsx";
export default function StepConsumption({ onNext, onBack }) {
	const { t } = useI18n();
	const { state, dispatch } = useWizard();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(consumptionSchema),
		defaultValues: state.consumption,
	});
	const mode = watch("inputMode");
	return (
		<form
			onSubmit={handleSubmit((v) => {
				dispatch({ type: "PATCH", section: "consumption", value: v });
				onNext();
			})}
		>
			<h2>{t("consumptionHeading")}</h2>
			<div className="field">
				<label htmlFor="inputMode">{t("consumptionModeQuestion")}</label>
				<select id="inputMode" {...register("inputMode")}>
					<option value="units">Average monthly units (kWh)</option>
					<option value="bill">Average monthly bill amount (₹)</option>
				</select>
			</div>
			{mode === "units" ? (
				<div className="field">
					<label htmlFor="monthlyUnits">{t("monthlyUnitsLabel")}</label>
					<input
						id="monthlyUnits"
						type="number"
						min="1"
						step="any"
						{...register("monthlyUnits")}
						aria-describedby="units-error"
					/>
					<FieldError id="units-error" error={errors.monthlyUnits} />
				</div>
			) : (
				<div className="field">
					<label htmlFor="billAmount">{t("monthlyBillLabel")}</label>
					<input
						id="billAmount"
						type="number"
						min="1"
						step="any"
						{...register("billAmount")}
						aria-describedby="bill-error"
					/>
					<FieldError id="bill-error" error={errors.billAmount} />
					<p className="muted">
						Units are estimated as bill amount ÷ tariff. Fixed charges are not
						separated in this phase.
					</p>
				</div>
			)}
			<div className="field">
				<label htmlFor="tariff">{t("tariffLabel")}</label>
				<input
					id="tariff"
					type="number"
					min="0.1"
					step="any"
					{...register("tariff")}
					aria-describedby="tariff-error"
				/>
				<FieldError id="tariff-error" error={errors.tariff} />
			</div>
			<div className="field">
				<label htmlFor="growthRate">{t("growthRateLabel")}</label>
				<input
					id="growthRate"
					type="number"
					min="0"
					max="100"
					step="1"
					{...register("growthRate")}
					aria-describedby="growth-error"
				/>
				<FieldError id="growth-error" error={errors.growthRate} />
			</div>
			<div className="actions">
				<button type="button" className="secondary" onClick={onBack}>
					{t("back")}
				</button>
				<button className="primary" type="submit">
					{t("saveContinue")}
				</button>
			</div>
		</form>
	);
}
