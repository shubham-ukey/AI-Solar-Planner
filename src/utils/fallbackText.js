export const AI_DISCLAIMER =
	"Estimates only. Verify subsidy and tariffs with your DISCOM and installer.";
const money = (n) =>
	n == null || !Number.isFinite(Number(n))
		? "not available"
		: `₹${Math.round(Number(n)).toLocaleString("en-IN")}`;
const num = (n, digits = 1) =>
	n == null || !Number.isFinite(Number(n))
		? "not available"
		: Number(n).toLocaleString("en-IN", { maximumFractionDigits: digits });
export function buildFallbackSummary(plan = {}) {
	const parts = [
		`Your estimated solar system is ${num(plan.systemKW)} kW with ${num(plan.panelCount, 0)} panels.`,
		`Estimated annual generation is ${num(plan.annualGenerationKWh, 0)} kWh and monthly savings are ${money(plan.monthlySavings)}.`,
		`The estimated net cost after listed subsidies is ${money(plan.netCost)}.`,
	];
	if (plan.roofLimited)
		parts.push("The system size has been limited by the available roof area.");
	if (plan.systemKW > (plan.subsidyLimitKW ?? 2))
		parts.push(
			"The selected system is above the stated subsidy limit; eligibility and the payable amount need official verification.",
		);
	if (plan.paybackYears == null)
		parts.push(
			"A payback period cannot be established with the current inputs.",
		);
	else
		parts.push(
			`The estimated payback period is ${num(plan.paybackYears)} years.`,
		);
	if (plan.batterySelected || plan.battery)
		parts.push(
			"A battery has been selected; confirm the required backup load and duration with your installer.",
		);
	return parts.join(" ");
}
export function buildFallbackFaq(plan = {}) {
	const faqs = [
		{
			question: "Why this system size?",
			answer: `The estimated system size is ${num(plan.systemKW)} kW, based on the consumption and roof inputs in your plan.`,
		},
		{
			question: "How is subsidy applied?",
			answer: `The plan lists central subsidy of ${money(plan.centralSubsidy)} and state subsidy of ${money(plan.stateSubsidy)}. Confirm current eligibility with your DISCOM.`,
		},
		{
			question: "What if my roof is small?",
			answer: plan.roofLimited
				? "The system has been limited by the roof area entered. Verify usable, unshaded roof space during a site survey."
				: "The current estimate does not indicate a roof capacity limit. Confirm usable roof space during a site survey.",
		},
		{
			question: "When will the system pay back?",
			answer:
				plan.paybackYears == null
					? "A payback period is not available with the current inputs. Review costs, savings and tariff assumptions."
					: `The estimated payback period is ${num(plan.paybackYears)} years; actual results may vary.`,
		},
		{
			question: "Do I need a battery?",
			answer:
				plan.batterySelected || plan.battery
					? "A battery is included in your selected plan. Confirm backup load, duration and battery sizing with an installer."
					: "A battery is optional and depends on your backup needs, budget and local power reliability.",
		},
	];
	return faqs;
}
