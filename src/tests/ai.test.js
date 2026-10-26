import { beforeEach, describe, it, expect, vi } from "vitest";
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.stubGlobal("fetch", fetchMock);
import {
	aiEnabled,
	generatePlanFaq,
	generatePlanSummary,
} from "../services/ai.js";
const plan = {
	systemKW: 3,
	panelCount: 6,
	annualGenerationKWh: 4000,
	monthlySavings: 2000,
	netCost: 90000,
	paybackYears: 5,
	centralSubsidy: 78000,
	stateSubsidy: 0,
	totalSubsidy: 78000,
	subsidyLimitKW: 2,
	rows: [],
};
beforeEach(() => {
	fetchMock.mockReset();
});
describe("AI service", () => {
	it("is disabled without the exact feature flag and proxy URL", () =>
		expect(aiEnabled()).toBe(false));
	it("returns fallback summary when disabled", async () => {
		const r = await generatePlanSummary(plan);
		expect(r.source).toBe("automatic");
		expect(r.text).toContain("3 kW");
		expect(fetchMock).not.toHaveBeenCalled();
	});
	it("falls back on invalid FAQ JSON shape", async () => {
		vi.stubEnv("VITE_ENABLE_AI", "true");
		vi.stubEnv("VITE_AI_PROXY_URL", "/api/ai");
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ faqs: [{ question: "bad", answer: "x" }] }),
		});
		const r = await generatePlanFaq(plan);
		expect(r.source).toBe("automatic");
		expect(r.faqs.length).toBe(5);
	});
	it("falls back after timeout", async () => {
		vi.stubEnv("VITE_ENABLE_AI", "true");
		vi.stubEnv("VITE_AI_PROXY_URL", "/api/ai");
		fetchMock.mockRejectedValue(
			Object.assign(new Error("aborted"), { name: "AbortError" }),
		);
		const r = await generatePlanSummary(plan);
		expect(r.source).toBe("automatic");
		expect(r.error).toMatch(/timed out/i);
	});
	it("rejects a summary containing an invented number", async () => {
		vi.stubEnv("VITE_ENABLE_AI", "true");
		vi.stubEnv("VITE_AI_PROXY_URL", "/api/ai");
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				summary: "Your system will save ₹12,345 each month.",
			}),
		});
		const r = await generatePlanSummary(plan);
		expect(r.source).toBe("automatic");
		expect(r.text).not.toContain("12,345");
		expect(r.text).toContain("3 kW");
	});
});
