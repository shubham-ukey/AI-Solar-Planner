import React from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roofSchema } from "../utils/schemas.js";
import { useWizard } from "../context/WizardContext.jsx";
import FieldError from "./FieldError.jsx";
export default function StepRoof({ onNext, onBack }) {
	const { t } = useI18n();
	const { state, dispatch } = useWizard();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(roofSchema), defaultValues: state.roof });
	return (
		<form
			onSubmit={handleSubmit((v) => {
				dispatch({ type: "PATCH", section: "roof", value: v });
				onNext();
			})}
		>
			<h2>{t("roofHeading")}</h2>
			<div className="field">
				<label htmlFor="roofAreaSqFt">{t("roofAreaLabel")}</label>
				<input
					id="roofAreaSqFt"
					type="number"
					min="1"
					step="any"
					{...register("roofAreaSqFt")}
					aria-describedby="area-error"
				/>
				<FieldError id="area-error" error={errors.roofAreaSqFt} />
			</div>
			<div className="field">
				<label htmlFor="direction">{t("directionLabel")}</label>
				<select id="direction" {...register("direction")}>
					{["south", "south-west", "south-east", "east", "west", "north"].map(
						(x) => (
							<option key={x} value={x}>
								{x.replace("-", " ").replace(/^./, (s) => s.toUpperCase())}
							</option>
						),
					)}
				</select>
			</div>
			<div className="field">
				<label htmlFor="shadowLevel">{t("shadowLevelLabel")}</label>
				<select id="shadowLevel" {...register("shadowLevel")}>
					{["none", "low", "medium", "high"].map((x) => (
						<option key={x}>{x}</option>
					))}
				</select>
				<small>
					Generation loss uses assumptions.json shadowLossFactors keys.
				</small>
			</div>
			<div className="field">
				<label htmlFor="roofType">{t("roofTypeLabel")}</label>
				<select id="roofType" {...register("roofType")}>
					{["flat concrete", "sloped tin", "sloped tile", "other"].map((x) => (
						<option key={x}>{x}</option>
					))}
				</select>
			</div>
			<div className="field">
				<label htmlFor="tiltDeg">{t("tiltLabel")}</label>
				<input
					id="tiltDeg"
					type="number"
					min="0"
					max="90"
					{...register("tiltDeg")}
					aria-describedby="tilt-error"
				/>
				<FieldError id="tilt-error" error={errors.tiltDeg} />
				<small>
					Editable estimate; default is a placeholder, not a measured site
					value.
				</small>
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
