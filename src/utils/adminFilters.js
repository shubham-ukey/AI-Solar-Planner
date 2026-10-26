export function filterAndSortLeads(leads, filters = {}) {
	const q = String(filters.search || "")
		.trim()
		.toLowerCase();
	let rows = leads.filter(
		(l) =>
			!q ||
			[l.name, l.city].some((v) =>
				String(v || "")
					.toLowerCase()
					.includes(q),
			),
	);
	if (filters.state) rows = rows.filter((l) => l.state === filters.state);
	if (filters.status) rows = rows.filter((l) => l.status === filters.status);
	if (filters.from)
		rows = rows.filter(
			(l) => String(l.createdAt || "").slice(0, 10) >= filters.from,
		);
	if (filters.to)
		rows = rows.filter(
			(l) => String(l.createdAt || "").slice(0, 10) <= filters.to,
		);
	const key = filters.sort || "updatedAt";
	const dir = filters.dir === "asc" ? 1 : -1;
	return [...rows].sort(
		(a, b) =>
			dir *
			String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, {
				numeric: true,
				sensitivity: "base",
			}),
	);
}
