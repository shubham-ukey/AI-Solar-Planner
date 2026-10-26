import { z } from "zod";
const yesNo = z.enum(["yes", "no"], { error: "Choose yes or no." });
export const eligibilitySchema = z.object({
	residential: yesNo,
	ownerConsent: yesNo,
	validConnection: yesNo,
	alreadySubsidised: yesNo,
	aadhaarBankLinked: yesNo,
});
export const locationSchema = z.object({
	state: z.string().trim().min(2, "Enter a state."),
	city: z.string().trim().min(2, "Enter a city."),
	discom: z.string().trim().min(2, "Choose or enter a DISCOM."),
	consumerNo: z.string().trim().optional(),
	address: z.string().trim().optional(),
	pincode: z.string().trim().optional(),
	latitude: z.coerce.number().optional(),
	longitude: z.coerce.number().optional(),
	sanctionedLoadKW: z.coerce
		.number()
		.positive("Sanctioned load must be greater than 0.")
		.optional()
		.or(z.literal("")),
});
export const consumptionSchema = z
	.object({
		inputMode: z.enum(["units", "bill"]),
		monthlyUnits: z.coerce
			.number()
			.min(0, "Units cannot be negative.")
			.optional(),
		billAmount: z.coerce
			.number()
			.min(0, "Bill amount cannot be negative.")
			.optional(),
		tariff: z.coerce.number().positive("Tariff must be greater than 0."),
		growthRate: z.coerce.number().min(0).max(100),
	})
	.superRefine((v, ctx) => {
		if (v.inputMode === "units" && !(Number(v.monthlyUnits) > 0))
			ctx.addIssue({
				code: "custom",
				path: ["monthlyUnits"],
				message: "Enter monthly units greater than 0.",
			});
		if (v.inputMode === "bill" && !(Number(v.billAmount) > 0))
			ctx.addIssue({
				code: "custom",
				path: ["billAmount"],
				message: "Enter a bill amount greater than 0.",
			});
	});
export const roofSchema = z.object({
	roofAreaSqFt: z.coerce.number().positive("Roof area must be greater than 0."),
	direction: z.enum([
		"south",
		"south-west",
		"south-east",
		"east",
		"west",
		"north",
	]),
	shadowLevel: z.enum(["none", "low", "medium", "high"]),
	roofType: z.enum(["flat concrete", "sloped tin", "sloped tile", "other"]),
	tiltDeg: z.coerce.number().min(0).max(90),
});
export const assumptionsSchema = z.object({
	psh: z.coerce.number().positive(),
	performanceRatio: z.coerce.number().positive().max(1),
	panelWatt: z.coerce.number().positive(),
	costPerKW: z.coerce.number().positive(),
	tariff: z.coerce.number().positive(),
	exportRate: z.coerce.number().min(0),
	degradationRate: z.coerce.number().min(0).max(1),
	tariffEscalationRate: z.coerce.number().min(0).max(1),
	annualLoanRate: z.coerce.number().min(0).max(100),
	emissionFactorKgPerKWh: z.coerce.number().min(0),
	depthOfDischarge: z.object({
		lithium: z.coerce.number().positive().max(1),
		leadAcid: z.coerce.number().positive().max(1),
	}),
	shadowLossFactors: z.object({
		none: z.coerce.number().min(0).max(1),
		low: z.coerce.number().min(0).max(1),
		medium: z.coerce.number().min(0).max(1),
		high: z.coerce.number().min(0).max(1),
	}),
	directionFactors: z.object({
		south: z.coerce.number().positive(),
		"south-west": z.coerce.number().positive(),
		"south-east": z.coerce.number().positive(),
		east: z.coerce.number().positive(),
		west: z.coerce.number().positive(),
		north: z.coerce.number().positive(),
	}),
	roofAreaSqFtPerKW: z.coerce.number().positive(),
	standardInverterSizesKW: z.array(z.coerce.number().positive()),
	panelDegradationSource: z.string(),
	costPerKWSource: z.string(),
	costPerKWLastVerified: z.string(),
});
