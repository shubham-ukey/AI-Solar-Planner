const money = value => value == null || !Number.isFinite(Number(value)) ? 'Not available' : `₹${Math.round(Number(value)).toLocaleString('en-IN')}`;
export function buildWhatsAppText(proposalId, plan) {
  return `Solar proposal ${proposalId}\nSystem: ${Number(plan.systemKW || 0).toLocaleString('en-IN')} kW (${Number(plan.panelCount || 0)} panels)\nEstimated net cost: ${money(plan.netCost)}\nEstimated monthly savings: ${money(plan.monthlySavings)}\nEstimated payback: ${plan.paybackYears == null ? 'Not available' : `${Number(plan.paybackYears).toFixed(1)} years`}\nEstimates only. Verify subsidy and tariffs with your DISCOM and installer.`;
}
export function buildWhatsAppUrl(proposalId, plan) { return `https://wa.me/?text=${encodeURIComponent(buildWhatsAppText(proposalId, plan))}`; }
