const COLUMNS = [
  ['clientId','Client ID'], ['name','Name'], ['email','Email'], ['phone','Phone'], ['city','City'], ['state','State'],
  ['status','Status'], ['systemKW','System kW'], ['netCost','Net cost (INR)'], ['revenueEstimate','Revenue estimate (INR)'],
  ['assignedTo','Assigned to'], ['createdAt','Created at'], ['updatedAt','Updated at'], ['notesText','Notes'],
];
function cell(value) {
  let s = value == null ? '' : String(value);
  if (/^[\s]*[=+\-@]/.test(s)) s = `'${s}`;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g,'""')}"`;
  return s;
}
export function formatLeadsCsv(leads = []) {
  const rows = [COLUMNS.map(([,label]) => cell(label)).join(',')];
  for (const lead of leads) {
    const row = {
      ...lead, systemKW: lead.results?.systemKW ?? lead.plan?.systemKW ?? lead.systemKW,
      netCost: lead.results?.netCost ?? lead.plan?.netCost ?? lead.netCost,
      notesText: (lead.notes || []).map(note => typeof note === 'string' ? note : note.text).join(' | '),
    };
    rows.push(COLUMNS.map(([key]) => cell(row[key])).join(','));
  }
  return '\uFEFF' + rows.join('\r\n');
}
export const LEAD_CSV_COLUMNS = COLUMNS.map(([key,label])=>({key,label}));
