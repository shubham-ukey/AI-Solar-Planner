import { describe, it, expect } from "vitest";
import { buildWhatsAppText, buildWhatsAppUrl } from "../utils/whatsapp.js";
describe("WhatsApp sharing", () => {
	it("URL-encodes the prefilled proposal text and requires no phone number", () => {
		const plan = {
			systemKW: 3,
			panelCount: 6,
			netCost: 102000,
			monthlySavings: 2500,
			paybackYears: 3.4,
		};
		const text = buildWhatsAppText("SOL-2026-0001", plan);
		const url = buildWhatsAppUrl("SOL-2026-0001", plan);
		expect(url).toContain("https://wa.me/?text=");
		expect(new URL(url).searchParams.get("text")).toBe(text);
		expect(text).toContain("SOL-2026-0001");
		expect(text).toContain("₹");
		expect(text).toContain("Verify subsidy");
	});
});
