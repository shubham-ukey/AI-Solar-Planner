import React from "react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin.jsx";
vi.mock("../services/adminAuth.js", () => ({
	loginAdmin: vi.fn(),
	adminFirebaseEnabled: () => false,
}));
import { loginAdmin } from "../services/adminAuth.js";
function setup() {
	return render(
		<MemoryRouter initialEntries={["/admin"]}>
			<Routes>
				<Route path="/admin" element={<AdminLogin />} />
				<Route path="/admin/leads" element={<p>Dashboard reached</p>} />
			</Routes>
		</MemoryRouter>,
	);
}
describe("AdminLogin", () => {
	beforeEach(() => vi.clearAllMocks());
	it("logs in and navigates to dashboard", async () => {
		loginAdmin.mockResolvedValue({ email: "admin" });
		setup();
		fireEvent.change(screen.getByLabelText("Demo password"), {
			target: { value: "good-pass" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
		expect(await screen.findByText("Dashboard reached")).toBeInTheDocument();
	});
	it("shows failure message", async () => {
		loginAdmin.mockRejectedValue(new Error("Incorrect password."));
		setup();
		fireEvent.change(screen.getByLabelText("Demo password"), {
			target: { value: "bad-pass" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Incorrect password.",
		);
	});
});
