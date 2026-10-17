import { calculateRequiredSystemSize, applyRoofCapacityLimit, calculatePanels, calculateGeneration } from '../engine/calculations.js';
import { calculateCentralSubsidy, calculateStateSubsidy } from '../engine/subsidy.js';
import { calculateMonthlySavings, calculateCostAndPayback, calculateCarbonOffset } from '../engine/calculations.js';
import { projectLifetime } from '../engine/financials.js';
import centralSubsidy from '../config/central_subsidy.json';
import stateSubsidy from '../config/state_subsidy.json';
export default function useSolarPlan(state) {
  const a=state.assumptions; const units=state.consumption.inputMode==='bill' ? Number(state.consumption.billAmount||0)/Number(state.consumption.tariff||a.tariff) : Number(state.consumption.monthlyUnits||0);
  const required=calculateRequiredSystemSize(units,a.psh,a.performanceRatio);
  const roof=applyRoofCapacityLimit(required,Number(state.roof.roofAreaSqFt||0),a.roofAreaSqFtPerKW||100);
  const panels=calculatePanels(roof.finalKW,a.panelWatt);
  const generation=calculateGeneration(panels.actualKW,a.psh,a.performanceRatio,state.roof.shadowLevel,state.roof.direction,{...a});
  const monthlyGeneration = generation.monthlyGenerationKWh;
  const energy = calculateMonthlySavings(monthlyGeneration, units, Number(state.consumption.tariff||a.tariff), a.exportRate);
  const central=calculateCentralSubsidy(panels.actualKW,centralSubsidy);
  const stateBenefit=calculateStateSubsidy(panels.actualKW,state.location.stateCode||'',stateSubsidy);
  const totalCost = panels.actualKW * a.costPerKW;
  const netCost = Math.max(0, totalCost - central - stateBenefit.subsidy);
  const financials = calculateCostAndPayback(panels.actualKW, a.costPerKW, central + stateBenefit.subsidy, energy.monthlySavings);
  const projection = projectLifetime({annualGenerationKWh:generation.annualGenerationKWh,monthlyUnits:units,tariff:Number(state.consumption.tariff||a.tariff),exportRate:a.exportRate,degradationRate:a.degradationRate,escalationRate:a.tariffEscalationRate,netCost,years:25});
  const rows = projection.rows.map(row => ({...row,cumulativeSavings:row.cumulativeSavings+netCost,selfConsumedKWh:Math.min(row.generationKWh,units*12),exportKWh:Math.max(0,row.generationKWh-units*12)}));
  const centralConfig = centralSubsidy; const stateConfig = stateSubsidy.states.find(x=>x.stateCode===state.location.stateCode);
  return {monthlyUnits:units,requiredKW:required,roofLimited:roof.roofLimited,systemKW:panels.actualKW,panelCount:panels.panelCount,requiredRoofAreaSqFt:panels.requiredAreaSqFt,roofAreaSqFt:Number(state.roof.roofAreaSqFt||0),annualGenerationKWh:generation.annualGenerationKWh,monthlyGenerationKWh:generation.monthlyGenerationKWh,monthlySavings:energy.monthlySavings,annualSavings:energy.annualSavings,totalCost,netCost:financials.netCost,paybackYears:financials.paybackYears,twentyFiveYearNetProfit:projection.twentyFiveYearNetProfit,roiPercent:projection.roiPercent,co2SavedKgPerYear:calculateCarbonOffset(generation.annualGenerationKWh,a.emissionFactorKgPerKWh),centralSubsidy:central,stateSubsidy:stateBenefit.subsidy,totalSubsidy:central+stateBenefit.subsidy,subsidyScheme:centralConfig.scheme,subsidySource:centralConfig.sourceUrl,lastVerified:centralConfig.lastVerified==='NOT_VERIFIED'?null:centralConfig.lastVerified,stateSubsidySource:stateConfig?.sourceUrl||null,stateLastVerified:stateConfig?.lastVerified||null,stateSubsidyScheme:stateConfig?.scheme||'State subsidy',subsidyLimitKW:2,assumptions:a,rows,monthlySelfConsumedKWh:energy.selfConsumedKWh,monthlyExportKWh:energy.exportKWh};
}
