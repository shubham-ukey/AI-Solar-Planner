import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { customerEmailSchema, sendProposalEmail } from "../services/email.js";
import { saveLead } from "../services/leads.js";
import { saveProposalRecord } from "../services/proposals.js";
import { downloadProposalPdf } from "../services/proposalPdf.js";
import { generatePlanFaq, generatePlanSummary } from "../services/ai.js";
import { nextProposalId } from "../utils/proposalId.js";
import { makeShareUrl } from "../utils/shareLink.js";
import { buildWhatsAppUrl } from "../utils/whatsapp.js";
import { buildProposalData } from "../utils/proposalData.js";

export default function ProposalShare({ plan, state }) {
	const { t } = useI18n();
	const [proposalId] = useState(() => nextProposalId());
	const [proposalCreatedAt] = useState(() => new Date().toISOString());
	const [aiResult, setAiResult] = useState(null);
	const [faqs, setFaqs] = useState(null);
	const [status, setStatus] = useState("");
	const [mailto, setMailto] = useState("");
	const [busy, setBusy] = useState(false);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(customerEmailSchema),
		mode: "onBlur",
		defaultValues: { name: "", phone: "", email: "", consent: false },
	});
	const customer = watch();
	useEffect(() => {
		let active = true;
		generatePlanSummary(plan).then((value) => {
			if (active) setAiResult(value);
		});
		generatePlanFaq(plan).then((value) => {
			if (active) setFaqs(value.faqs);
		});
		saveProposalRecord({
			id: proposalId,
			status: "Created",
			createdAt: proposalCreatedAt,
			assumptionsSnapshot: plan.assumptions,
			computedPlanSnapshot: {
				systemKW: plan.systemKW,
				panelCount: plan.panelCount,
				annualGenerationKWh: plan.annualGenerationKWh,
				monthlyGenerationKWh: plan.monthlyGenerationKWh,
				centralSubsidy: plan.centralSubsidy,
				stateSubsidy: plan.stateSubsidy,
				totalSubsidy: plan.totalSubsidy,
				totalCost: plan.totalCost,
				netCost: plan.netCost,
				monthlySavings: plan.monthlySavings,
				paybackYears: plan.paybackYears,
				twentyFiveYearNetProfit: plan.twentyFiveYearNetProfit,
				roiPercent: plan.roiPercent,
			},
		});
		return () => {
			active = false;
		};
	}, [plan, proposalId]);
	const shareUrl = useMemo(() => {
		try {
			return makeShareUrl(state);
		} catch {
			return "";
		}
	}, [state]);
	const proposal = useMemo(
		() =>
			buildProposalData({
				proposalId,
				customer: {
					...customer,
					city: state.location?.city,
					state: state.location?.state,
				},
				plan,
				aiResult,
				faqs,
			}),
		[
			proposalId,
			customer,
			plan,
			aiResult,
			faqs,
			state.location?.city,
			state.location?.state,
		],
	);
	const onDownload = async () => {
		try {
			await downloadProposalPdf({
				proposalId,
				customer: {
					...customer,
					city: state.location?.city,
					state: state.location?.state,
				},
				plan,
				aiResult,
				faqs,
			});
			setStatus(`PDF download started for ${proposalId}.`);
		} catch {
			setStatus("The PDF could not be generated. Please try again.");
		}
	};
	const onEmail = async (values) => {
		setBusy(true);
		setStatus("Preparing your proposal email…");
		setMailto("");
		const currentProposal = buildProposalData({
			proposalId,
			customer: {
				...values,
				city: state.location?.city,
				state: state.location?.state,
			},
			plan,
			aiResult,
			faqs,
		});
		const result = await sendProposalEmail({
			customer: values,
			proposal: currentProposal,
			shareUrl,
		});
		const lead = await saveLead({
			proposalId,
			name: values.name,
			phone: values.phone,
			email: values.email,
			consentGiven: values.consent,
			state: state.location?.state || "",
			systemKW: plan.systemKW,
			netCost: plan.netCost,
			status: result.sent ? "Proposal Sent" : "Lead",
			createdAt: new Date().toISOString(),
			emailSentAt: result.sent ? new Date().toISOString() : null,
		});
		await saveProposalRecord({
			id: proposalId,
			status: result.sent ? "Proposal Sent" : "Lead",
			createdAt: proposalCreatedAt,
			emailSentAt: result.sent ? new Date().toISOString() : null,
		});
		if (result.sent) {
			setStatus(
				`Proposal ${proposalId} was emailed successfully. Your request was saved (${lead.mode}).`,
			);
		} else if (result.validation) {
			setStatus("Please correct the highlighted fields.");
		} else if (result.rateLimited) {
			setStatus("Please wait a moment before requesting another email.");
		} else {
			setMailto(result.mailto || "");
			setStatus(
				result.fallback
					? "EmailJS is not configured. Your lead was saved; use the prefilled email link below to send manually."
					: "Email could not be sent automatically. Your lead was saved; use the prefilled email link below to send manually.",
			);
		}
		setBusy(false);
	};
	const onCopy = async () => {
		if (!shareUrl) {
			setStatus(
				"The current planner inputs are incomplete for sharing. Complete the planner and try again.",
			);
			return;
		}
		try {
			await navigator.clipboard.writeText(shareUrl);
			setStatus("Shareable plan link copied to clipboard.");
		} catch {
			const area = document.createElement("textarea");
			area.value = shareUrl;
			area.setAttribute("readonly", "");
			area.style.position = "fixed";
			area.style.opacity = "0";
			document.body.appendChild(area);
			area.select();
			const copied = document.execCommand("copy");
			area.remove();
			if (copied) setStatus("Shareable plan link copied to clipboard.");
			else setStatus(`Copy failed. Select and copy this link: ${shareUrl}`);
		}
	};
	const onWhatsApp = () => {
		window.open(
			buildWhatsAppUrl(proposalId, plan),
			"_blank",
			"noopener,noreferrer",
		);
		saveProposalRecord({
			id: proposalId,
			status: "WhatsApp Shared",
			createdAt: proposalCreatedAt,
			whatsappShared: true,
		});
		setStatus(
			"WhatsApp share opened in a new tab. Review the message before sending.",
		);
	};
	return (
		<section
			className="result-card proposal-share"
			aria-labelledby="proposal-share-title"
		>
			<h2 id="proposal-share-title">{t("shareDownload")}</h2>
			<p className="muted">
				Generate a proposal PDF or share this read-only plan. The share link
				contains recomputation inputs only—not your name, phone, email, consumer
				number or exact address.
			</p>
			<div className="proposal-id">
				<span>Proposal ID</span>
				<strong>{proposalId}</strong>
				<span>Proposal date: {proposal.date}</span>
			</div>
			<div className="proposal-actions" aria-label="Proposal actions">
				<button type="button" className="primary" onClick={onDownload}>
					{t("downloadPdf")}
				</button>
				<button type="button" className="secondary" onClick={onWhatsApp}>
					{t("whatsapp")}
				</button>
				<button type="button" className="secondary" onClick={onCopy}>
					{t("copyLink")}
				</button>
				<Link
					className="secondary button-link"
					to={shareUrl ? `/shared${new URL(shareUrl).hash}` : "/shared"}
				>
					Preview shared plan
				</Link>
			</div>
			<h3>{t("emailProposal")}</h3>
			<form
				className="proposal-email-form"
				onSubmit={handleSubmit(onEmail)}
				noValidate
			>
				<div className="field">
					<label htmlFor="proposal-name">Full name</label>
					<input id="proposal-name" autoComplete="name" {...register("name")} />
					{errors.name && <p className="field-error">{errors.name.message}</p>}
				</div>
				<div className="field">
					<label htmlFor="proposal-phone">Phone number</label>
					<input
						id="proposal-phone"
						type="tel"
						inputMode="numeric"
						autoComplete="tel-national"
						maxLength="10"
						{...register("phone")}
					/>
					{errors.phone && (
						<p className="field-error">{errors.phone.message}</p>
					)}
				</div>
				<div className="field">
					<label htmlFor="proposal-email">Email address</label>
					<input
						id="proposal-email"
						type="email"
						autoComplete="email"
						{...register("email")}
					/>
					{errors.email && (
						<p className="field-error">{errors.email.message}</p>
					)}
				</div>
				<div className="field consent-field">
					<label>
						<input type="checkbox" {...register("consent")} /> I consent to
						being contacted about this solar proposal.
					</label>
					{errors.consent && (
						<p className="field-error">{errors.consent.message}</p>
					)}
				</div>
				<p className="privacy-note">
					Privacy: only your name, phone, email, consent, state, proposal ID,
					system size, net cost and request status are saved for follow-up. This
					project stores data locally for development unless Firebase is
					explicitly configured.
				</p>
				<button className="primary" type="submit" disabled={busy}>
					{busy ? "Processing…" : "Email proposal / request follow-up"}
				</button>
			</form>
			{mailto && (
				<p className="notice">
					<a href={mailto}>
						Open your email app with a prefilled proposal summary
					</a>
				</p>
			)}
			<p className="proposal-status" role="status" aria-live="polite">
				{status}
			</p>
			<p className="disclaimer">
				Estimates only. Verify subsidy and tariffs with your DISCOM and
				installer.
			</p>
		</section>
	);
}
