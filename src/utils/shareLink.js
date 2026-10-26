import { z } from "zod";

const number = z.number().finite().min(0);
const shareAssumptionsSchema = z
	.object({
		psh: z.number().finite().positive(),
		performanceRatio: z.number().finite().positive().max(1),
		panelWatt: z.number().finite().positive(),
		costPerKW: z.number().finite().positive(),
		tariff: z.number().finite().positive(),
		exportRate: number,
		degradationRate: z.number().min(0).max(1),
		tariffEscalationRate: z.number().min(0).max(1),
		emissionFactorKgPerKWh: number,
		roofAreaSqFtPerKW: z.number().finite().positive(),
		shadowLossFactors: z
			.object({ none: number, low: number, medium: number, high: number })
			.strict(),
		directionFactors: z
			.object({
				south: z.number().positive(),
				"south-west": z.number().positive(),
				"south-east": z.number().positive(),
				east: z.number().positive(),
				west: z.number().positive(),
				north: z.number().positive(),
			})
			.strict(),
	})
	.strict();
const shareSchema = z
	.object({
		location: z.object({ stateCode: z.string().max(12).optional() }).strict(),
		consumption: z
			.object({
				inputMode: z.enum(["units", "bill"]),
				monthlyUnits: z.union([number, z.string().max(30)]),
				billAmount: z.union([number, z.string().max(30)]),
				tariff: number,
			})
			.strict(),
		roof: z
			.object({
				roofAreaSqFt: number,
				direction: z.enum([
					"south",
					"south-west",
					"south-east",
					"east",
					"west",
					"north",
				]),
				shadowLevel: z.enum(["none", "low", "medium", "high"]),
			})
			.strict(),
		assumptions: shareAssumptionsSchema,
	})
	.strict();
const pickInputs = (state) => ({
	location: {
		...(state.location?.stateCode
			? { stateCode: String(state.location.stateCode) }
			: {}),
	},
	consumption: {
		inputMode: state.consumption?.inputMode === "bill" ? "bill" : "units",
		monthlyUnits: state.consumption?.monthlyUnits ?? 0,
		billAmount: state.consumption?.billAmount ?? "",
		tariff: Number(state.consumption?.tariff ?? state.assumptions?.tariff ?? 7),
	},
	roof: {
		roofAreaSqFt: Number(state.roof?.roofAreaSqFt ?? 0),
		direction: state.roof?.direction ?? "south",
		shadowLevel: state.roof?.shadowLevel ?? "none",
	},
	assumptions: Object.fromEntries(
		[
			"psh",
			"performanceRatio",
			"panelWatt",
			"costPerKW",
			"tariff",
			"exportRate",
			"degradationRate",
			"tariffEscalationRate",
			"emissionFactorKgPerKWh",
			"roofAreaSqFtPerKW",
			"shadowLossFactors",
			"directionFactors",
		].map((key) => [key, state.assumptions?.[key]]),
	),
});
const encodeBase64Url = (text) => {
	const bytes = new TextEncoder().encode(text);
	let binary = "";
	bytes.forEach((byte) => {
		binary += String.fromCharCode(byte);
	});
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
};
const decodeBase64Url = (value) => {
	if (!/^[A-Za-z0-9_-]+$/.test(value))
		throw new Error(
			"This shared plan link is invalid or out of date. Create a new link from the planner.",
		);
	const padded =
		value.replace(/-/g, "+").replace(/_/g, "/") +
		"=".repeat((4 - (value.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
};
export function encodePlanInputs(state) {
	const inputs = pickInputs(state);
	const parsed = shareSchema.safeParse(inputs);
	if (!parsed.success)
		throw new Error(
			"The plan inputs could not be shared. Review the planner inputs and try again.",
		);
	return `v1.${encodeBase64Url(JSON.stringify(parsed.data))}`;
}
export function decodePlanInputs(encoded) {
	try {
		const [version, payload, extra] = String(encoded || "").split(".");
		if (version !== "v1" || !payload || extra)
			throw new Error("unsupported version");
		const parsed = shareSchema.safeParse(JSON.parse(decodeBase64Url(payload)));
		if (!parsed.success) throw new Error("invalid data");
		return { ...parsed.data, step: 4 };
	} catch {
		throw new Error(
			"This shared plan link is invalid or from an older version. Ask the sender to create a new link.",
		);
	}
}
export function makeShareUrl(
	state,
	origin = globalThis.location?.origin || "",
) {
	return `${origin}/shared#plan=${encodeURIComponent(encodePlanInputs(state))}`;
}
export { shareSchema };
