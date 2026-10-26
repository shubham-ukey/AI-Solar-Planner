import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
vi.mock("../services/ai.js", () => ({
	aiEnabled: () => false,
	generatePlanSummary: async () => ({
		source: "automatic",
		text: "Plan fallback.",
		disclaimer:
			"Estimates only. Verify subsidy and tariffs with your DISCOM and installer.",
	}),
	generatePlanFaq: async () => ({
		source: "automatic",
		faqs: [
			{
				question: "Why this system size?",
				answer: "Based on your plan inputs.",
			},
			{
				question: "How is subsidy applied?",
				answer: "Verify with your DISCOM.",
			},
			{
				question: "What if my roof is small?",
				answer: "A site survey confirms roof area.",
			},
			{
				question: "When will it pay back?",
				answer: "Depends on current inputs.",
			},
		],
		disclaimer:
			"Estimates only. Verify subsidy and tariffs with your DISCOM and installer.",
	}),
	askPlanQuestion: async () => ({
		source: "automatic",
		text: "Fallback answer.",
		disclaimer:
			"Estimates only. Verify subsidy and tariffs with your DISCOM and installer.",
	}),
}));
import AIAdvisor from "../components/AIAdvisor.jsx";
const plan = {
	systemKW: 2,
	panelCount: 4,
	annualGenerationKWh: 1000,
	monthlySavings: 500,
	netCost: 50000,
	centralSubsidy: 30000,
	stateSubsidy: 0,
	paybackYears: null,
	subsidyLimitKW: 2,
	rows: [],
};
describe("AI advisor chatbot", () => {
	it("renders automatic output and disclaimer", async () => {
		render(<AIAdvisor plan={plan} />);
		expect(await screen.findByText("Plan fallback.")).toBeTruthy();
		expect(screen.getAllByText(/Estimates only/).length).toBeGreaterThan(0);
	});
	it("opens and closes with button and Escape", async () => {
		render(<AIAdvisor plan={plan} />);
		fireEvent.click(
			screen.getByRole("button", { name: /ask solar assistant/i }),
		);
		expect(screen.getByRole("dialog")).toBeTruthy();
		fireEvent.keyDown(document, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(
			screen
				.getByRole("button", { name: /ask solar assistant/i })
				.getAttribute("aria-expanded"),
		).toBe("false");
	});
	it("sends a suggested question", async () => {
		render(<AIAdvisor plan={plan} />);
		fireEvent.click(
			screen.getByRole("button", { name: /ask solar assistant/i }),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Why this system size?" }),
		);
		expect(await screen.findByText("Fallback answer.")).toBeTruthy();
	});
});
