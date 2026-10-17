export function calculateRevenueEstimate(leads = []) {
  return leads.reduce((sum, lead) => ['Approved','Installed'].includes(lead.status) ? sum + Math.max(0, Number(lead.results?.netCost ?? lead.plan?.netCost ?? lead.netCost ?? 0) || 0) : sum, 0);
}
