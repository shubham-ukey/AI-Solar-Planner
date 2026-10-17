import { useEffect, useRef } from "react";
export default function DeleteLeadDialog({
	open,
	onCancel,
	onConfirm,
	busy = false,
}) {
	const ref = useRef(null);
	useEffect(() => {
		if (!open) return;
		const node = ref.current;
		node?.querySelector("button:not(:disabled)")?.focus();
		const key = (e) => {
			if (e.key === "Escape") onCancel();
			if (e.key === "Tab") {
				const items = node?.querySelectorAll("button:not(:disabled)");
				if (!items?.length) return;
				const first = items[0],
					last = items[items.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", key);
		return () => document.removeEventListener("keydown", key);
	}, [open, onCancel]);
	if (!open) return null;
	return (
		<div className="admin-modal-backdrop">
			<section
				className="admin-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-title"
				tabIndex={-1}
				ref={ref}
			>
				<h2 id="delete-title">Delete this lead?</h2>
				<p>
					This permanently removes the lead and its notes from the current data
					store. This action cannot be undone.
				</p>
				<div className="admin-actions">
					<button
						className="button button-secondary"
						onClick={onCancel}
						disabled={busy}
					>
						Cancel
					</button>
					<button
						className="button button-danger"
						onClick={onConfirm}
						disabled={busy}
					>
						{busy ? "Deleting…" : "Delete lead"}
					</button>
				</div>
			</section>
		</div>
	);
}
