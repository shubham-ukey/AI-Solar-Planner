import {describe,it,expect} from 'vitest';import {projectLifetime} from '../engine/financials.js';
describe('projectLifetime',()=>{it('returns 25 rows by default',()=>{const p=projectLifetime({annualGenerationKWh:5000,monthlyUnits:300,tariff:7,exportRate:3,netCost:100000});expect(p.rows).toHaveLength(25);expect(p.rows[0]).toHaveProperty('cumulativeSavings');expect(p.rows[24].year).toBe(25)})});
