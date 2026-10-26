import { describe, it, expect } from "vitest";
import { formatLeadsCsv } from "../utils/leadsCsv.js";
describe("CSV export formatter", () => {
	it("adds UTF-8 BOM and headers", () => {
		const csv = formatLeadsCsv([]);
		expect(csv.charCodeAt(0)).toBe(0xfeff);
		expect(csv).toContain("Client ID,Name");
	});
	it("escapes commas, quotes, and newlines and neutralizes formulas", () => {
		const csv = formatLeadsCsv([
			{
				clientId: "x",
				name: 'Smith, "Sam"\nOne',
				email: '=HYPERLINK("x")',
				phone: "+cmd",
				city: "-danger",
				state: "@start",
				status: "Lead",
				notes: [{ text: "hello, world" }],
			},
		]);
		expect(csv).toContain('"Smith, ""Sam""\nOne"');
		expect(csv).toContain("'=HYPERLINK(");
		expect(csv).toContain("'+cmd");
		expect(csv).toContain("'-danger");
		expect(csv).toContain("'@start");
		expect(csv).toContain("hello, world");
	});
	it("handles an empty lead list", () => {
		expect(formatLeadsCsv([]).split("\r\n")).toHaveLength(1);
	});
});
