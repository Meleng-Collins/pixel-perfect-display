import Decimal from 'decimal.js';
import { z } from 'zod';
import { calculateLoan } from './loan';

export const affordabilitySchema = z.object({ amount:z.number().positive().max(1000000000), months:z.number().int().min(1).max(600), budget:z.number().positive().max(1000000000), annualRate:z.number().min(0).max(100), lang:z.enum(['en','fr']) });
export function compareScenarios(input:z.infer<typeof affordabilitySchema>) {
  const valid=affordabilitySchema.parse(input);
  return [...new Set([Math.max(1,valid.months-6),valid.months,Math.min(600,valid.months+6)])].map(months=>{
    const loan=calculateLoan(valid.amount,valid.annualRate,months);
    if(!loan) throw new Error('Invalid loan');
    return {months,payment:new Decimal(loan.payment).toDecimalPlaces(2).toNumber(),total:new Decimal(loan.total).toDecimalPlaces(2).toNumber(),interest:new Decimal(loan.interest).toDecimalPlaces(2).toNumber(),remaining:new Decimal(valid.budget).minus(loan.payment).toDecimalPlaces(2).toNumber(),fitsBudget:new Decimal(loan.payment).lte(valid.budget)};
  });
}