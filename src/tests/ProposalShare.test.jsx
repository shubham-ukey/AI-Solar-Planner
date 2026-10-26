import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProposalShare from "../components/ProposalShare.jsx";
vi.mock("../services/ai.js", () => ({
	generatePlanSummary: vi.fn(async () => ({
		source: "automatic",
		text: "Fallback summary.",
	})),
	generatePlanFaq: vi.fn(async () => ({
		faqs: [
			{
				question: "Why this system size?",
				answer: "This is a computed estimate.",
			},
		],
	})),
}));
vi.mock("../services/email.js", async (importOriginal) => {
	const actual = await importOriginal();
	return { ...actual, sendProposalEmail: vi.fn() };
});
vi.mock("../services/leads.js", () => ({ saveLead: vi.fn() }));
vi.mock("../services/proposalPdf.js", () => ({ downloadProposalPdf: vi.fn() }));
vi.mock("../utils/proposalId.js", () => ({
	nextProposalId: () => "SOL-2026-0001",
}));
vi.mock("../utils/shareLink.js", () => ({
	makeShareUrl: () => "https://example.test/shared#plan=v1.test",
}));
vi.mock("../utils/whatsapp.js", () => ({
	buildWhatsAppUrl: () => "https://wa.me/?text=test",
}));
const state = {
	location: { city: "Gondia", state: "Maharashtra" },
	eligibility: {},
	consumption: {
		inputMode: "units",
		monthlyUnits: 300,
		tariff: 7,
		growthRate: 5,
	},
	roof: {
		roofAreaSqFt: 400,
		direction: "south",
		shadowLevel: "none",
		roofType: "flat concrete",
		tiltDeg: 20,
	},
	assumptions: {},
};
const plan = {
	systemKW: 3,
	panelCount: 6,
	roofAreaSqFt: 400,
	annualGenerationKWh: 4500,
	monthlyGenerationKWh: 375,
	monthlySavings: 2500,
	totalCost: 180000,
	netCost: 102000,
	paybackYears: 3.4,
	centralSubsidy: 78000,
	stateSubsidy: 0,
	totalSubsidy: 78000,
	rows: [],
	assumptions: { annualLoanRate: 9 },
};
describe("ProposalShare accessible UI", () => {
	it("renders keyboard-operable sharing buttons, labelled fields and status region", () => {
		render(<ProposalShare plan={plan} state={state} />);
		expect(
			screen.getByRole("heading", { name: "Share and download" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Download PDF" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "WhatsApp" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Copy plan link" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Full name")).toBeInTheDocument();
		expect(
			screen.getByLabelText(/consent to being contacted/i),
		).toBeInTheDocument();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});
});
