export const formatINR = (value) =>
	new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(value);
export const formatKWh = (value) =>
	`${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value)} kWh`;
export const formatKW = (value) =>
	`${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)} kW`;
