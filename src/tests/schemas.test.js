import { describe, it, expect } from "vitest";
import {
	eligibilitySchema,
	locationSchema,
	consumptionSchema,
	roofSchema,
	assumptionsSchema,
} from "../utils/schemas.js";
import defaults from "../config/assumptions.json";
describe("planner Zod schemas", () => {
	it("accepts a complete eligibility checklist", () =>
		expect(
			eligibilitySchema.safeParse({
				residential: "yes",
				ownerConsent: "yes",
				validConnection: "yes",
				alreadySubsidised: "no",
				aadhaarBankLinked: "yes",
			}).success,
		).toBe(true));
	it("rejects missing state/city and DISCOM", () =>
		expect(
			locationSchema.safeParse({ state: "", city: "", discom: "" }).success,
		).toBe(false));
	it("requires a positive monthly unit value in units mode", () =>
		expect(
			consumptionSchema.safeParse({
				inputMode: "units",
				monthlyUnits: 0,
				tariff: 7,
				growthRate: 5,
			}).success,
		).toBe(false));
	it("accepts roof factors using the configured key vocabulary", () =>
		expect(
			roofSchema.safeParse({
				roofAreaSqFt: 300,
				direction: "south-west",
				shadowLevel: "medium",
				roofType: "flat concrete",
				tiltDeg: 20,
			}).success,
		).toBe(true));
	it("accepts the configured assumptions", () =>
		expect(assumptionsSchema.safeParse(defaults).success).toBe(true));
});
