import { describe,it,expect } from 'vitest';
import { compareScenarios, affordabilitySchema } from './affordability';
describe('Borrower affordability',()=>{
  const input={amount:120000,months:12,budget:10000,annualRate:0,lang:'en' as const};
  it('compares amount and term against monthly budget',()=>{const selected=compareScenarios(input).find(s=>s.months===12);expect(selected).toMatchObject({payment:10000,total:120000,remaining:0,fitsBudget:true});});
  it('reports a budget shortfall without implying approval',()=>{expect(compareScenarios({...input,budget:9000}).find(s=>s.months===12)).toMatchObject({remaining:-1000,fitsBudget:false});});
  it('compares shorter and longer repayment terms',()=>{expect(compareScenarios(input).map(s=>s.months)).toEqual([6,12,18]);});
  it('rejects missing positive monthly budgets',()=>{expect(affordabilitySchema.safeParse({...input,budget:0}).success).toBe(false);});
});