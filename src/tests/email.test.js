import { describe, it, expect, vi } from "vitest";
import {
	customerEmailSchema,
	sendProposalEmail,
	checkEmailRateLimit,
	buildMailtoUrl,
} from "../services/email.js";
const memoryStorage = () => {
	const m = new Map();
	return {
		getItem: (k) => m.get(k) || null,
		setItem: (k, v) => m.set(k, String(v)),
	};
};
const customer = {
	name: "Shubham Ukey",
	phone: "9876543210",
	email: "shubham@example.com",
	consent: true,
};
const proposal = {
	proposalId: "SOL-2026-0001",
	date: "2026-10-17",
	summary: "System size 3 kW.",
	system: { systemKW: 3, panelCount: 6 },
	cost: { netCost: 102000, monthlySavings: 2500, paybackYears: 3.4 },
	disclaimer: "Estimates only.",
};
describe("proposal email service", () => {
	it("validates customer email and explicit consent", () => {
		expect(customerEmailSchema.safeParse(customer).success).toBe(true);
		expect(
			customerEmailSchema.safeParse({ ...customer, email: "bad" }).success,
		).toBe(false);
		expect(
			customerEmailSchema.safeParse({ ...customer, consent: false }).success,
		).toBe(false);
		expect(
			customerEmailSchema.safeParse({ ...customer, phone: "123" }).success,
		).toBe(false);
	});
	it("uses a prefilled mailto fallback when EmailJS is disabled", async () => {
		const result = await sendProposalEmail({
			customer,
			proposal,
			shareUrl: "https://example.test/shared#plan=v1.x",
			storage: memoryStorage(),
			now: 100000,
		});
		expect(result.sent).toBe(false);
		expect(result.fallback).toBe(true);
		expect(result.mailto).toContain("mailto:shubham%40example.com");
		expect(decodeURIComponent(result.mailto)).toContain("SOL-2026-0001");
	});
	it("enforces a client-side request cooldown", () => {
		const storage = memoryStorage();
		expect(checkEmailRateLimit({ now: 1000, storage }).allowed).toBe(true);
		expect(checkEmailRateLimit({ now: 1500, storage }).allowed).toBe(false);
		expect(checkEmailRateLimit({ now: 62000, storage }).allowed).toBe(true);
	});
	it("builds a mailto body with a summary and share link", () => {
		expect(
			decodeURIComponent(
				buildMailtoUrl({
					email: "x@example.com",
					proposalId: "SOL-2026-0001",
					summary: "Summary",
					shareUrl: "https://example.test",
				}),
			),
		).toContain("https://example.test");
	});
});
