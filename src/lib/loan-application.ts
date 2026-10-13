import { z } from 'zod';

export type LendingPolicy = { require_income: boolean; require_guarantor: boolean };
export const loanStatuses = ['submitted', 'under_review', 'info_requested', 'approved', 'declined'] as const;
export type LoanStatus = (typeof loanStatuses)[number];

export const statusLabels: Record<LoanStatus, [string, string]> = {
  submitted: ['Submitted', 'Soumise'],
  under_review: ['Under review', 'En cours d’examen'],
  info_requested: ['Information requested', 'Informations demandées'],
  approved: ['Approved by cooperative', 'Approuvée par la coopérative'],
  declined: ['Declined', 'Refusée'],
};

const text = (max: number) => z.string().trim().max(max);

export const baseApplicationSchema = z.object({
  membership_number: text(40).min(1, 'Membership number is required'),
  amount: z.number().int().positive().max(1_000_000_000),
  term_months: z.number().int().min(1).max(600),
  purpose: text(1000).min(3, 'Purpose is required'),
  phone: text(30).min(6, 'Phone number is required'),
  email: z.string().trim().email().max(255),
  address: text(300),
  monthly_income: z.number().int().min(0).max(1_000_000_000).nullable(),
  occupation: text(160),
  employer: text(160),
  guarantor_name: text(160),
  guarantor_phone: text(30),
  guarantor_relationship: text(80),
});
export type LoanApplicationInput = z.infer<typeof baseApplicationSchema>;

/** Applies the cooperative's lending policy on top of the always-required fields. */
export function applicationSchema(policy: LendingPolicy) {
  return baseApplicationSchema.superRefine((v, ctx) => {
    if (policy.require_income) {
      if (v.monthly_income === null) ctx.addIssue({ code: 'custom', path: ['monthly_income'], message: 'Monthly income is required' });
      if (!v.occupation) ctx.addIssue({ code: 'custom', path: ['occupation'], message: 'Occupation is required' });
    }
    if (policy.require_guarantor) {
      if (!v.guarantor_name) ctx.addIssue({ code: 'custom', path: ['guarantor_name'], message: 'Guarantor name is required' });
      if (!v.guarantor_phone) ctx.addIssue({ code: 'custom', path: ['guarantor_phone'], message: 'Guarantor phone is required' });
    }
  });
}
