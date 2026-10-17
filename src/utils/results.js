export function findBreakEvenYear(rows, netCost = 0) {
  if (!Array.isArray(rows) || !Number.isFinite(Number(netCost))) return null;
  const row = rows.find((item) => Number(item.cumulativeSavings) >= Number(netCost));
  return row ? row.year : null;
}
export function formatProjectionCsv(rows) {
  const header = ['Year','Generation (kWh)','Tariff (INR/kWh)','Self-consumed (kWh)','Export (kWh)','Savings (INR)','Cumulative (INR)'];
  const lines = rows.map(r => [r.year,r.generationKWh,r.tariff,r.selfConsumedKWh,r.exportKWh,r.savings,r.cumulativeSavings].map(v => Number(v).toFixed(2)).join(','));
  return [header.join(','),...lines].join('\r\n');
}
export function downloadProjectionCsv(rows, filename='solar-financial-projection.csv') {
  const blob = new Blob([formatProjectionCsv(rows)], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href=url; link.download=filename; link.click(); URL.revokeObjectURL(url);
}
