import centralConfig from "../config/central_subsidy.json";
import stateConfig from "../config/state_subsidy.json";

/** Section 6.2 central subsidy. Config supplies all monetary values. */
export function calculateCentralSubsidy(kW, config = centralConfig) {
  if (kW < 0) throw new RangeError("System size must be non-negative.");
  const first = config.slabs[0];
  const second = config.slabs[1];
  if (kW <= first.upToKW) return Math.min(kW * first.ratePerKW, config.maxSubsidy);
  if (kW <= second.upToKW) return Math.min(first.upToKW * first.ratePerKW + (kW - first.upToKW) * second.ratePerKW, config.maxSubsidy);
  return config.maxSubsidy;
}

export function calculateStateSubsidy(kW, stateCode, config = stateConfig) {
  if (kW < 0) throw new RangeError("System size must be non-negative.");
  const state = config.states.find((entry) => entry.stateCode === stateCode);
  if (!state) return { subsidy: 0, found: false, note: "No verified state subsidy configuration is available." };
  return { subsidy: Math.min(kW * state.subsidyPerKW, state.maxSubsidy), found: true, conditions: state.conditions, lastVerified: state.lastVerified, sourceUrl: state.sourceUrl };
}

export function calculateTotalSubsidy(kW, stateCode, centralConfig = centralConfigDefault(), stateConfigArg = stateConfig) {
  const central = calculateCentralSubsidy(kW, centralConfig);
  const state = calculateStateSubsidy(kW, stateCode, stateConfigArg);
  return { centralSubsidy: central, stateSubsidy: state.subsidy, totalSubsidy: central + state.subsidy, stateConfigFound: state.found };
}
function centralConfigDefault() { return centralConfig; }
