import { buildProposalData } from '../utils/proposalData.js';

const n = (value, digits=1) => value == null || !Number.isFinite(Number(value)) ? 'Not available' : Number(value).toLocaleString('en-IN',{maximumFractionDigits:digits});
const money = value => value == null || !Number.isFinite(Number(value)) ? 'Not available' : `INR ${Math.round(Number(value)).toLocaleString('en-IN')}`;
export function buildPdfContent(options) { return buildProposalData(options); }
export async function createProposalPdf(options) {
  const { jsPDF } = await import('jspdf');
  const data = buildPdfContent(options);
  const pdf = new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  const page = { width:210, height:297, left:16, right:194, bottom:280 };
  let y=18;
  const addPageIfNeeded = (height=8) => { if(y+height>page.bottom){pdf.addPage();y=18;} };
  const heading = title => { addPageIfNeeded(13); pdf.setFont('helvetica','bold');pdf.setFontSize(12);pdf.text(title,page.left,y);y+=7;pdf.setFont('helvetica','normal');pdf.setFontSize(9); };
  const line = (label,value) => { const text=`${label}: ${value == null ? 'Not available' : String(value)}`.replace(/₹/g,'INR ').replace(/[–—]/g,'-'); const wrapped=pdf.splitTextToSize(text,page.right-page.left); addPageIfNeeded(wrapped.length*4.6+2);pdf.text(wrapped,page.left,y);y+=wrapped.length*4.6+1.5; };
  const paragraph = text => { const wrapped=pdf.splitTextToSize(String(text||'').replace(/₹/g,'INR ').replace(/[–—]/g,'-'),page.right-page.left); wrapped.forEach(chunk=>{addPageIfNeeded(5.5);pdf.text(chunk,page.left,y);y+=4.6;});y+=2; };
  const section = (title,items) => { heading(title); items.forEach(([label,value])=>line(label,value)); y+=2; };
  pdf.setFillColor(20,61,47);pdf.rect(0,0,210,35,'F');pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(20);pdf.text('SOLAR INSTALLATION PROPOSAL',page.left,15);pdf.setFont('helvetica','normal');pdf.setFontSize(10);pdf.text(`${data.proposalId}  |  ${data.date}`,page.left,25);pdf.setTextColor(25,40,32);y=45;
  section('Customer details',[['Name',data.customer.name],['Phone',data.customer.phone],['Email',data.customer.email],['City / State',[data.customer.city,data.customer.state].filter(Boolean).join(', ')||'Not provided']]);
  section('System summary',[['Recommended system',`${n(data.system.systemKW,2)} kW`],['Panel count',n(data.system.panelCount,0)],['Panel wattage',data.system.panelWatt ? `${n(data.system.panelWatt,0)} W`:'Not available'],['Estimated annual generation',`${n(data.system.annualGenerationKWh,0)} kWh`],['Estimated monthly generation',`${n(data.system.monthlyGenerationKWh,0)} kWh`],['Roof-limited',data.system.roofLimited?'Yes':'No'],['Roof area supplied',`${n(data.system.roofAreaSqFt,0)} sq ft`]]);
  section('Subsidy breakdown',[['Central scheme',data.subsidy.centralScheme],['Central subsidy',money(data.subsidy.central)],['Central source',data.subsidy.centralSource],['Central last verified',data.subsidy.centralLastVerified],['State scheme',data.subsidy.stateScheme],['State subsidy',money(data.subsidy.state)],['State source',data.subsidy.stateSource],['State last verified',data.subsidy.stateLastVerified],['Total listed subsidy',money(data.subsidy.total)]]);
  section('Cost and financial summary',[['Gross system cost',money(data.cost.totalCost)],['Net cost after listed subsidies',money(data.cost.netCost)],['Estimated monthly savings',money(data.cost.monthlySavings)],['Estimated annual savings',money(data.cost.annualSavings)],['Estimated payback',data.cost.paybackYears==null?'Not available':`${n(data.cost.paybackYears,2)} years`],['25-year net savings after cost',money(data.cost.twentyFiveYearNetProfit)],['25-year ROI',`${n(data.cost.roiPercent,1)}%`]]);
  section('EMI illustration',[['Loan principal',money(data.emi.principal)],['Annual interest rate',`${n(data.emi.annualRate,2)}%`],['Tenure',`${n(data.emi.tenureMonths,0)} months`],['Estimated monthly EMI',money(data.emi.monthlyEmi)],['Estimated total interest',money(data.emi.totalInterest)],['Estimated total payment',money(data.emi.totalPayment)]]);
  heading('25-year projection summary');
  const chartRows=[data.lifetime.year1,data.lifetime.year5,data.lifetime.year10,data.lifetime.year15,data.lifetime.year20,data.lifetime.year25].filter(Boolean);
  const tableHeader=['Year','Generation kWh','Savings','Cumulative savings'];
  const drawTableRow=(cells,header=false)=>{addPageIfNeeded(7);if(header){pdf.setFillColor(232,241,231);pdf.rect(page.left,y-4,178,7,'F');pdf.setFont('helvetica','bold');}else pdf.setFont('helvetica','normal');pdf.setFontSize(7.7);const xs=[page.left,page.left+20,page.left+63,page.left+111];cells.forEach((cell,i)=>pdf.text(String(cell),xs[i],y));y+=7;};
  drawTableRow(tableHeader,true);chartRows.forEach(r=>drawTableRow([r.year,n(r.generationKWh,0),money(r.savings),money(r.cumulativeSavings)]));y+=2;
  heading('25-year cumulative savings chart');
  addPageIfNeeded(42);const chartX=page.left,chartY=y,chartW=174,chartH=34;pdf.setDrawColor(160,175,164);pdf.rect(chartX,chartY,chartW,chartH);const values=data.lifetime.rows.map(r=>Number(r.cumulativeSavings||0));const min=Math.min(0,...values),max=Math.max(1,...values);let prev=null;values.forEach((v,i)=>{const point={x:chartX+(i/Math.max(1,values.length-1))*chartW,y:chartY+chartH-3-((v-min)/(max-min))*(chartH-6)};if(prev)pdf.line(prev.x,prev.y,point.x,point.y);prev=point;});y+=chartH+8;
  section('AI / automatic plan summary',[]);paragraph(data.summary);
  heading('Frequently asked questions');data.faqs.slice(0,8).forEach((faq,index)=>{paragraph(`${index+1}. ${faq.question}`);paragraph(faq.answer);});
  section('Assumptions used',[['Peak sun hours',n(data.assumptions.psh,2)],['Performance ratio',n(data.assumptions.performanceRatio,2)],['Retail tariff',money(data.assumptions.tariff)],['Export rate',money(data.assumptions.exportRate)],['Panel degradation per year',data.assumptions.degradationRate==null?'Not available':`${n(data.assumptions.degradationRate*100,2)}%`],['Tariff escalation per year',data.assumptions.tariffEscalationRate==null?'Not available':`${n(data.assumptions.tariffEscalationRate*100,2)}%`],['Cost per kW source',data.assumptions.costPerKWSource||'Not supplied'],['Cost per kW last verified',data.assumptions.costPerKWLastVerified||'Not yet verified']]);
  heading('Terms and disclaimer');paragraph(data.terms);paragraph(data.disclaimer);paragraph('Installer contact: Not configured in this demo.');
  const pages=pdf.getNumberOfPages();for(let i=1;i<=pages;i++){pdf.setPage(i);pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(100,110,104);pdf.text(`SolarPlan - ${data.proposalId} - Page ${i} of ${pages}`,page.left,289);}
  return { pdf, data, filename: `solar-proposal-${data.proposalId}.pdf` };
}
export async function downloadProposalPdf(options) {
  const result = await createProposalPdf(options);
  result.pdf.save(result.filename);
  return result.data;
}
