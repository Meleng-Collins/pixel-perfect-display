import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { applicationSchema, baseApplicationSchema, loanStatuses } from './loan-application';

export const myLoansQuery = { queryKey: ['my-loans'], queryFn: () => getMyLoans() };
export const getMyLoans = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [policy, apps] = await Promise.all([
    context.supabase.from('lending_policy').select('require_income,require_guarantor').maybeSingle(),
    context.supabase.from('loan_applications').select('id,amount,term_months,purpose,status,reviewer_note,created_at').eq('user_id', context.userId).order('created_at', { ascending: false }),
  ]);
  if (policy.error || apps.error) throw new Error('Applications could not be loaded');
  return { policy: policy.data ?? { require_income: true, require_guarantor: true }, applications: apps.data ?? [] };
});

export const submitLoanApplication = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(baseApplicationSchema).handler(async ({ data, context }) => {
  const { data: policy } = await context.supabase.from('lending_policy').select('require_income,require_guarantor').maybeSingle();
  const parsed = applicationSchema(policy ?? { require_income: true, require_guarantor: true }).safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid application');
  const { error } = await context.supabase.from('loan_applications').insert({ ...parsed.data, user_id: context.userId });
  if (error) { console.error('loan insert', error.message); throw new Error(error.message.includes('limit') ? 'Daily application limit reached' : 'Application could not be submitted'); }
  return { ok: true };
});

async function requireReviewer(context: { supabase: any }) {
  const { data } = await context.supabase.rpc('has_permission', { _permission: 'loans.review' });
  if (!data) throw new Error('Access denied');
}

export const reviewLoansQuery = { queryKey: ['review-loans'], queryFn: () => getLoansForReview() };
export const getLoansForReview = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireReviewer(context);
  const [apps, policy] = await Promise.all([
    context.supabase.from('loan_applications').select('*').order('created_at', { ascending: false }).limit(200),
    context.supabase.from('lending_policy').select('require_income,require_guarantor').maybeSingle(),
  ]);
  if (apps.error) throw new Error('Applications could not be loaded');
  return { applications: apps.data ?? [], policy: policy.data ?? { require_income: true, require_guarantor: true } };
});

export const reviewLoan = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: z.enum(loanStatuses), reviewer_note: z.string().trim().max(2000) }))
  .handler(async ({ data, context }) => {
    await requireReviewer(context);
    const { error } = await context.supabase.from('loan_applications').update({ status: data.status, reviewer_note: data.reviewer_note }).eq('id', data.id);
    if (error) throw new Error('Review could not be saved');
    return { ok: true };
  });

export const saveLendingPolicy = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ require_income: z.boolean(), require_guarantor: z.boolean() }))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!admin) throw new Error('Access denied');
    const { error } = await context.supabase.from('lending_policy').update(data).eq('id', true);
    if (error) throw new Error('Policy could not be saved');
    return { ok: true };
  });
