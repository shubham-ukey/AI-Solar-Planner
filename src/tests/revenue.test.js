import { it, expect } from "vitest";
import { calculateRevenueEstimate } from "../engine/revenue.js";
it("sums stored net cost for Approved and Installed only", () => {
	expect(
		calculateRevenueEstimate([
			{ status: "Approved", results: { netCost: 100 } },
			{ status: "Installed", results: { netCost: 250 } },
			{ status: "Lead", results: { netCost: 900 } },
			{ status: "Closed Lost", netCost: 700 },
		]),
	).toBe(350);
});
