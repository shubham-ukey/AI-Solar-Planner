import {describe,it,expect} from 'vitest';
import {buildFallbackFaq,buildFallbackSummary} from '../utils/fallbackText.js';
const base={systemKW:3,panelCount:6,annualGenerationKWh:4000,monthlySavings:2500,netCost:90000,paybackYears:5,centralSubsidy:78000,stateSubsidy:0,subsidyLimitKW:2,roofLimited:false};
describe('fallback text templates',()=>{
 it('covers roof limited plans',()=>expect(buildFallbackSummary({...base,roofLimited:true})).toContain('limited by the available roof area'));
 it('covers system above subsidy limit',()=>expect(buildFallbackSummary(base)).toContain('above the stated subsidy limit'));
 it('covers null payback',()=>expect(buildFallbackSummary({...base,paybackYears:null})).toContain('payback period cannot be established'));
 it('covers selected battery',()=>expect(buildFallbackSummary({...base,batterySelected:true})).toContain('battery has been selected'));
 it('returns five useful FAQs including roof and subsidy',()=>{const f=buildFallbackFaq(base);expect(f).toHaveLength(5);expect(f.map(x=>x.question).join(' ')).toContain('roof');expect(f.map(x=>x.question).join(' ')).toContain('subsidy');});
});
