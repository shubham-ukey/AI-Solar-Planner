export const LEAD_STATUSES = ['Lead','Survey Done','Proposal Sent','Approved','Installed','Closed Lost'];
const TRANSITIONS = {
  'Lead': ['Survey Done','Closed Lost'],
  'Survey Done': ['Proposal Sent','Closed Lost'],
  'Proposal Sent': ['Approved','Closed Lost'],
  'Approved': ['Installed','Closed Lost'],
  'Installed': [],
  'Closed Lost': ['Lead'],
};
export function allowedStatusTransitions(status) { return [...(TRANSITIONS[status] || [])]; }
export function canTransitionLeadStatus(from, to) { return allowedStatusTransitions(from).includes(to); }
export function transitionLeadStatus(lead, to, now = new Date().toISOString()) {
  if (!canTransitionLeadStatus(lead.status, to)) throw new Error(`Status transition not allowed: ${lead.status} → ${to}`);
  const history = [...(lead.statusHistory || []), { from: lead.status, to, at: now }];
  return { ...lead, status: to, statusHistory: history, updatedAt: now };
}
