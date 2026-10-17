import React, { useEffect, useRef, useState } from "react";
import {
	generatePlanFaq,
	generatePlanSummary,
	askPlanQuestion,
	aiEnabled,
} from "../services/ai.js";
import {
	AI_DISCLAIMER,
	buildFallbackFaq,
	buildFallbackSummary,
} from "../utils/fallbackText.js";
const suggestions = [
	"Why this system size?",
	"How is subsidy applied?",
	"What if my roof is small?",
	"When will the system pay back?",
];
export default function AIAdvisor({ plan }) {
	const [summary, setSummary] = useState({
		source: "automatic",
		text: buildFallbackSummary(plan),
		disclaimer: AI_DISCLAIMER,
	});
	const [faqs, setFaqs] = useState({
		source: "automatic",
		faqs: buildFallbackFaq(plan),
		disclaimer: AI_DISCLAIMER,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [open, setOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [messages, setMessages] = useState([]);
	const [chatLoading, setChatLoading] = useState(false);
	const dialogRef = useRef(null);
	const triggerRef = useRef(null);
	const inputRef = useRef(null);
	useEffect(() => {
		let alive = true;
		setLoading(true);
		Promise.all([generatePlanSummary(plan), generatePlanFaq(plan)])
			.then(([s, f]) => {
				if (alive) {
					setSummary(s);
					setFaqs(f);
					setError(s.error || f.error || "");
				}
			})
			.catch(() => {
				if (alive) setError("AI output unavailable; automatic text is shown.");
			})
			.finally(() => {
				if (alive) setLoading(false);
			});
		return () => {
			alive = false;
		};
	}, [plan]);
	useEffect(() => {
		if (open) {
			inputRef.current?.focus();
			const dialog = dialogRef.current;
			const focusable = () =>
				dialog?.querySelectorAll(
					"button:not([disabled]),input:not([disabled]),a[href]",
				) || [];
			const onKey = (e) => {
				if (e.key === "Escape") {
					setOpen(false);
					triggerRef.current?.focus();
				}
				if (e.key === "Tab") {
					const els = [...focusable()];
					if (!els.length) return;
					const first = els[0],
						last = els[els.length - 1];
					if (e.shiftKey && document.activeElement === first) {
						e.preventDefault();
						last.focus();
					} else if (!e.shiftKey && document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			};
			document.addEventListener("keydown", onKey);
			return () => document.removeEventListener("keydown", onKey);
		}
	}, [open]);
	async function send(q = question) {
		const text = String(q).trim();
		if (!text || chatLoading || messages.length >= 12) return;
		const next = [...messages, { role: "user", content: text.slice(0, 500) }];
		setMessages(next);
		setQuestion("");
		setChatLoading(true);
		let result;
		if (!aiEnabled()) {
			const match = buildFallbackFaq(plan).find(
				(f) => f.question.toLowerCase() === text.toLowerCase(),
			);
			result = {
				source: "automatic",
				text:
					match?.answer ||
					"AI chat is disabled. Choose one of the suggested questions or contact your solar installer for plan-specific help.",
				disclaimer: AI_DISCLAIMER,
			};
		} else {
			result = await askPlanQuestion(plan, text, next.slice(-6));
			if (result.error) {
				const match = buildFallbackFaq(plan).find(
					(f) => f.question.toLowerCase() === text.toLowerCase(),
				);
				if (match)
					result = { ...result, text: match.answer, source: "automatic" };
			}
		}
		setMessages((prev) =>
			[
				...prev,
				{
					role: "assistant",
					content: result.text,
					disclaimer: result.disclaimer,
					source: result.source,
				},
			].slice(-14),
		);
		setChatLoading(false);
	}
	const sourceLabel = (x) =>
		x === "ai" ? "AI-generated" : "Generated automatically";
	return (
		<section
			className="result-card ai-advisor"
			aria-labelledby="ai-advisor-title"
		>
			<h2 id="ai-advisor-title">Plan explanation</h2>
			{loading && <p role="status">Preparing your plan explanation…</p>}
			{error && (
				<p className="notice warning" role="status">
					{error} Automatic fallback text is available.
				</p>
			)}
			<p className="eyebrow">{sourceLabel(summary.source)}</p>
			<p>{summary.text}</p>
			<p className="disclaimer">{AI_DISCLAIMER}</p>
			<h3>Frequently asked questions</h3>
			<p className="eyebrow">{sourceLabel(faqs.source)}</p>
			<div className="ai-faqs">
				{faqs.faqs.map((faq, i) => (
					<details key={`${faq.question}-${i}`}>
						<summary>{faq.question}</summary>
						<p>{faq.answer}</p>
						<small>{AI_DISCLAIMER}</small>
					</details>
				))}
			</div>
			<button
				ref={triggerRef}
				type="button"
				className="chat-fab"
				onClick={() => setOpen(true)}
				aria-haspopup="dialog"
				aria-expanded={open}
			>
				Ask solar assistant
			</button>
			{open && (
				<div className="chat-backdrop">
					<section
						ref={dialogRef}
						className="chat-dialog"
						role="dialog"
						aria-modal="true"
						aria-labelledby="chat-title"
					>
						<div className="chat-heading">
							<h2 id="chat-title">Solar plan assistant</h2>
							<button
								className="secondary"
								type="button"
								onClick={() => {
									setOpen(false);
									triggerRef.current?.focus();
								}}
								aria-label="Close chat"
							>
								Close
							</button>
						</div>
						<p className="muted">
							Ask about your plan or basic solar concepts.
						</p>
						<div
							className="chat-messages"
							aria-live="polite"
							aria-relevant="additions text"
						>
							{messages.map((m, i) => (
								<div className={`chat-message ${m.role}`} key={i}>
									<strong>{m.role === "user" ? "You" : "Assistant"}</strong>
									<p>{m.content}</p>
									{m.disclaimer && <small>{m.disclaimer}</small>}
								</div>
							))}
							{chatLoading && <p role="status">Thinking…</p>}
						</div>
						<h3>Suggested questions</h3>
						<div className="chat-suggestions">
							{suggestions.map((s) => (
								<button
									key={s}
									type="button"
									className="secondary"
									onClick={() => send(s)}
									disabled={chatLoading || messages.length >= 12}
								>
									{s}
								</button>
							))}
						</div>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								send();
							}}
						>
							<label htmlFor="chat-question">Your question</label>
							<input
								ref={inputRef}
								id="chat-question"
								maxLength={500}
								value={question}
								onChange={(e) => setQuestion(e.target.value)}
								placeholder="Ask about your solar plan"
							/>
							<button
								className="primary"
								disabled={
									chatLoading || !question.trim() || messages.length >= 12
								}
							>
								Send
							</button>
						</form>
						<p className="disclaimer">{AI_DISCLAIMER}</p>
						<p>
							<a href="mailto:solar-installer@example.com?subject=Solar%20plan%20question">
								Contact your installer
							</a>
						</p>
						<small>
							{aiEnabled()
								? "AI is enabled when the proxy is available."
								: "AI is disabled; suggested answers remain available."}{" "}
							{12 - messages.length} messages remaining.
						</small>
					</section>
				</div>
			)}
		</section>
	);
}
