import { z } from "zod";
export const customerEmailSchema = z.object({
	name: z.string().trim().min(2, "Enter your name.").max(100),
	phone: z
		.string()
		.trim()
		.regex(/^\d{10}$/, "Enter a 10-digit phone number."),
	email: z.string().trim().email("Enter a valid email address.").max(254),
	consent: z.literal(true, {
		error: "Consent is required before requesting the proposal.",
	}),
});
export const emailEnabled = () =>
	import.meta.env.VITE_ENABLE_EMAILJS === "true" &&
	Boolean(
		import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() &&
		import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() &&
		import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim(),
	);
export function checkEmailRateLimit({
	now = Date.now(),
	storage = globalThis.localStorage,
	windowMs = 60_000,
} = {}) {
	const key = "solar-proposal-email-last-request";
	let previous = 0;
	try {
		previous = Number(storage?.getItem(key) || 0);
	} catch {}
	if (previous && now - previous < windowMs)
		return { allowed: false, waitMs: windowMs - (now - previous) };
	try {
		storage?.setItem(key, String(now));
	} catch {}
	return { allowed: true, waitMs: 0 };
}
export function buildMailtoUrl({ email, proposalId, summary, shareUrl }) {
	const subject = `Solar proposal ${proposalId}`;
	const body = `Hello,\n\nHere is the summary of your solar proposal ${proposalId}.\n\n${summary}\n\nOpen the read-only plan: ${shareUrl}\n\nThe PDF can be downloaded from the results page.\n\nEstimates only. Verify subsidy and tariffs with your DISCOM and installer.`;
	return `mailto:${encodeURIComponent(email || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
export async function sendProposalEmail({
	customer,
	proposal,
	shareUrl,
	storage = globalThis.localStorage,
	now = Date.now(),
} = {}) {
	const parsed = customerEmailSchema.safeParse({
		...customer,
		consent: customer?.consent,
	});
	if (!parsed.success)
		return { sent: false, validation: parsed.error.flatten().fieldErrors };
	const rate = checkEmailRateLimit({ now, storage });
	if (!rate.allowed)
		return { sent: false, rateLimited: true, waitMs: rate.waitMs };
	const mailto = buildMailtoUrl({
		email: parsed.data.email,
		proposalId: proposal.proposalId,
		summary: proposal.summary,
		shareUrl,
	});
	if (!emailEnabled()) return { sent: false, fallback: true, mailto };
	try {
		const response = await fetch(
			"https://api.emailjs.com/api/v1.0/email/send",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
					template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
					user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
					template_params: {
						to_email: parsed.data.email,
						to_name: parsed.data.name,
						phone: parsed.data.phone,
						proposal_id: proposal.proposalId,
						proposal_date: proposal.date,
						proposal_summary: proposal.summary,
						system_kw: String(proposal.system.systemKW),
						panel_count: String(proposal.system.panelCount),
						net_cost: String(proposal.cost.netCost),
						monthly_savings: String(proposal.cost.monthlySavings),
						payback_years:
							proposal.cost.paybackYears == null
								? "Not available"
								: String(proposal.cost.paybackYears),
						share_link: shareUrl,
						disclaimer: proposal.disclaimer,
					},
				}),
			},
		);
		if (!response.ok)
			throw new Error(`EmailJS request failed (${response.status}).`);
		return { sent: true };
	} catch (error) {
		return {
			sent: false,
			error: error?.message || "Email could not be sent.",
			mailto,
		};
	}
}
