import {describe,it,expect} from 'vitest';
import {formatProposalId,nextProposalId} from '../utils/proposalId.js';
const fakeStorage=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value))};};
describe('proposal ID',()=>{
  it('matches the SRS example format',()=>{expect(formatProposalId(2026,1)).toBe('SOL-2026-0001');expect(formatProposalId(2026,42)).toMatch(/^SOL-2026-\d{4,}$/)});
  it('is a pure formatter for fixed inputs',()=>{expect(formatProposalId(2026,7)).toBe(formatProposalId(2026,7))});
  it('generates unique sequential IDs across many calls',()=>{const storage=fakeStorage();const ids=Array.from({length:1500},()=>nextProposalId({date:new Date('2026-03-02T10:00:00Z'),storage}));expect(new Set(ids).size).toBe(1500);expect(ids[0]).toBe('SOL-2026-0001');expect(ids.at(-1)).toBe('SOL-2026-1500')});
  it('rejects invalid inputs',()=>{expect(()=>formatProposalId(99,1)).toThrow();expect(()=>formatProposalId(2026,0)).toThrow()});
});
