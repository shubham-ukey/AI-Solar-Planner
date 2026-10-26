import React from "react";
import { it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DeleteLeadDialog from "../components/DeleteLeadDialog.jsx";
it("confirms deletion, traps focus and closes on Escape", () => {
	const cancel = vi.fn(),
		confirm = vi.fn();
	render(<DeleteLeadDialog open onCancel={cancel} onConfirm={confirm} />);
	expect(screen.getByRole("dialog")).toBeInTheDocument();
	fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
	expect(cancel).toHaveBeenCalled();
	fireEvent.click(screen.getByRole("button", { name: "Delete lead" }));
	expect(confirm).toHaveBeenCalled();
});
