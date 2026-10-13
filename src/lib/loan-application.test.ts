import { describe, expect, it } from 'vitest';
import { applicationSchema, type LoanApplicationInput } from './loan-application';

const minimal: LoanApplicationInput = {
  membership_number: 'M-001', amount: 500000, term_months: 12, purpose: 'Shop stock', phone: '+237600000000', email: 'a@b.cm',
  address: '', monthly_income: null, occupation: '', employer: '', guarantor_name: '', guarantor_phone: '', guarantor_relationship: '',
};
const off = { require_income: false, require_guarantor: false };

describe('loan application rules', () => {
  it('accepts required fields only when policy does not require income or guarantor', () => {
    expect(applicationSchema(off).safeParse(minimal).success).toBe(true);
  });
  it('requires membership number', () => {
    expect(applicationSchema(off).safeParse({ ...minimal, membership_number: ' ' }).success).toBe(false);
  });
  it('requires contact phone', () => {
    expect(applicationSchema(off).safeParse({ ...minimal, phone: '' }).success).toBe(false);
  });
  it('requires income when policy says so', () => {
    expect(applicationSchema({ ...off, require_income: true }).safeParse(minimal).success).toBe(false);
    expect(applicationSchema({ ...off, require_income: true }).safeParse({ ...minimal, monthly_income: 200000, occupation: 'Trader' }).success).toBe(true);
  });
  it('requires guarantor when policy says so', () => {
    expect(applicationSchema({ ...off, require_guarantor: true }).safeParse(minimal).success).toBe(false);
    expect(applicationSchema({ ...off, require_guarantor: true }).safeParse({ ...minimal, guarantor_name: 'Jean', guarantor_phone: '670000000' }).success).toBe(true);
  });
});
