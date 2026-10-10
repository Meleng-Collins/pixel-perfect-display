import { describe, expect, it } from 'vitest';
import { calculateLoan } from './loan';

describe('monthly loan estimates', () => {
  it('uses principal divided by months for a zero-interest loan', () => {
    expect(calculateLoan(120000, 0, 12)?.payment).toBe(10000);
    expect(calculateLoan(120000, 0, 12)?.interest).toBe(0);
  });
  it('uses the nominal annual rate divided by 12 in the fixed payment formula', () => {
    expect(calculateLoan(1000000, 12, 12)?.payment).toBeCloseTo(88848.7887, 3);
  });
  it('clears the final outstanding balance with the final installment', () => {
    expect(calculateLoan(1000000, 12, 12)?.rows.at(-1)?.balance).toBe(0);
  });
  it('adds fees to total payable without treating fees as principal', () => {
    expect(calculateLoan(120000, 0, 12, 5000)?.payable).toBe(125000);
  });
  it('rejects invalid durations and negative interest rates', () => {
    expect(calculateLoan(100000, 12, 0)).toBeNull();
    expect(calculateLoan(100000, -1, 12)).toBeNull();
  });
});