import React, { lazy, Suspense } from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema } from "../utils/schemas.js";
import { useWizard } from "../context/WizardContext.jsx";
import discomData from "../config/discoms.json";
import FieldError from "./FieldError.jsx";
import { mapsEnabled } from "../services/maps.js";
const MapsLocation = lazy(() => import("./MapsLocation.jsx"));
export default function StepLocation({ onNext, onBack }) {
	const { t } = useI18n();
	const { state, dispatch } = useWizard();
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(locationSchema),
		defaultValues: state.location,
	});
	const chosen = watch("discom");
	return (
		<form
			onSubmit={handleSubmit((v) => {
				dispatch({ type: "PATCH", section: "location", value: v });
				onNext();
			})}
		>
			<h2>{t("locationHeading")}</h2>
			<p className="muted">{t("locationNote")}</p>
			{mapsEnabled() && (
				<Suspense fallback={<p role="status">Loading address search…</p>}>
					<MapsLocation setValue={setValue} />
				</Suspense>
			)}
			<div className="field">
				<label htmlFor="state">{t("stateLabel")}</label>
				<input
					id="state"
					autoComplete="address-level1"
					{...register("state")}
					aria-describedby="state-error"
				/>
				<FieldError id="state-error" error={errors.state} />
			</div>
			<div className="field">
				<label htmlFor="address">{t("addressLabel")}</label>
				<input
					id="address"
					{...register("address")}
					autoComplete="street-address"
				/>
				<small>Exact address is not included in share links.</small>
			</div>
			<div className="field">
				<label htmlFor="pincode">{t("pincodeLabel")}</label>
				<input
					id="pincode"
					{...register("pincode")}
					inputMode="numeric"
					autoComplete="postal-code"
				/>
			</div>
			<div className="field">
				<label htmlFor="city">{t("cityLabel")}</label>
				<input
					id="city"
					autoComplete="address-level2"
					{...register("city")}
					aria-describedby="city-error"
				/>
				<FieldError id="city-error" error={errors.city} />
			</div>
			<div className="field">
				<label htmlFor="discom">{t("discomLabel")}</label>
				<select
					id="discom"
					{...register("discom")}
					aria-describedby="discom-error"
				>
					<option value="">Choose a DISCOM or enter manually below</option>
					{discomData.discoms.map((d) => (
						<option key={d.name} value={d.name}>
							{d.state} — {d.name}
						</option>
					))}
				</select>
				<FieldError id="discom-error" error={errors.discom} />
				{chosen === "Manual / enter local DISCOM" && (
					<p className="muted">
						For now, select the generic entry and enter the actual DISCOM name
						in the text field below.
					</p>
				)}
			</div>
			<div className="field">
				<label htmlFor="discomManual">DISCOM name (manual)</label>
				<input
					id="discomManual"
					value={chosen === "Manual / enter local DISCOM" ? "" : chosen || ""}
					onChange={(e) =>
						setValue("discom", e.target.value, { shouldValidate: true })
					}
					aria-describedby="discomManual-help"
				/>
				<small id="discomManual-help">
					Use the official name shown on your electricity bill.
				</small>
			</div>
			<div className="field">
				<label htmlFor="consumerNo">Consumer number (optional)</label>
				<input id="consumerNo" {...register("consumerNo")} />
			</div>
			<div className="field">
				<label htmlFor="sanctionedLoadKW">Sanctioned load (kW, optional)</label>
				<input
					id="sanctionedLoadKW"
					type="number"
					min="0.1"
					step="0.1"
					{...register("sanctionedLoadKW")}
					aria-describedby="load-error"
				/>
				<FieldError id="load-error" error={errors.sanctionedLoadKW} />
			</div>
			<div className="actions">
				<button type="button" className="secondary" onClick={onBack}>
					Back
				</button>
				<button className="primary" type="submit">
					{t("saveContinue")}
				</button>
			</div>
		</form>
	);
}
