import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { myLoansQuery, submitLoanApplication } from '@/lib/loans.functions';
import { applicationSchema, statusLabels, type LoanStatus } from '@/lib/loan-application';
import { pageHead } from '@/lib/page-head';
import { PortalShell } from '@/components/portal/shell';
import { useSession } from '@/components/portal/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/_authenticated/apply')({
  head: () => pageHead('Loan application', 'Submit a NATINCCUL loan application for review by the cooperative.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(myLoansQuery),
  component: Apply,
});

const fmt = (n: number, fr: boolean) => new Intl.NumberFormat(fr ? 'fr-CM' : 'en-CM').format(n) + ' FCFA';

function Apply() {
  const { data } = useSuspenseQuery(myLoansQuery);
  const { lang, user } = useSession();
  const fr = lang === 'fr';
  const client = useQueryClient();
  const submit = useServerFn(submitLoanApplication);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const { require_income: needIncome, require_guarantor: needGuarantor } = data.policy;
  const t = (en: string, f: string) => (fr ? f : en);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const s = (k: string) => String(f.get(k) ?? '').trim();
    const num = (k: string) => (s(k) === '' ? null : Number(s(k)));
    const input = {
      membership_number: s('membership_number'), amount: Number(s('amount')), term_months: Number(s('term_months')), purpose: s('purpose'),
      phone: s('phone'), email: s('email'), address: s('address'), monthly_income: num('monthly_income'), occupation: s('occupation'), employer: s('employer'),
      guarantor_name: s('guarantor_name'), guarantor_phone: s('guarantor_phone'), guarantor_relationship: s('guarantor_relationship'),
    };
    const parsed = applicationSchema(data.policy).safeParse(input);
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? t('Please check the form', 'Veuillez vérifier le formulaire')); return; }
    setBusy(true); setMessage('');
    try {
      await submit({ data: parsed.data });
      await client.invalidateQueries({ queryKey: ['my-loans'] });
      form.reset(); setConsent(false);
      setMessage(t('Application submitted. The cooperative will review it and contact you.', 'Demande soumise. La coopérative l’examinera et vous contactera.'));
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Error'); } finally { setBusy(false); }
  }

  const field = (name: string, label: string, opts: { required?: boolean; type?: string; max?: number; defaultValue?: string } = {}) => (
    <label className="field">{label}{opts.required ? ' *' : ''}
      <Input name={name} type={opts.type ?? 'text'} required={opts.required} maxLength={opts.type === 'number' ? undefined : opts.max ?? 160} min={opts.type === 'number' ? 0 : undefined} defaultValue={opts.defaultValue} />
    </label>
  );

  return (
    <PortalShell title={t('Loan application', 'Demande de prêt')}>
      <p className="portal-lead">{t('Submitting an application does not mean approval. The cooperative reviews every request under its lending policy.', 'Soumettre une demande ne signifie pas une approbation. La coopérative examine chaque demande selon sa politique de crédit.')}</p>

      {data.applications.length > 0 && (
        <section className="mt-8">
          <h2>{t('My applications', 'Mes demandes')}</h2>
          {data.applications.map((a) => (
            <div className="portal-list-row" key={a.id}>
              <span>{fmt(Number(a.amount), fr)} · {a.term_months} {t('months', 'mois')}<small className="block fine-print">{a.purpose}</small></span>
              <span><strong>{statusLabels[a.status as LoanStatus]?.[fr ? 1 : 0]}</strong>{a.reviewer_note && <small className="block fine-print">{a.reviewer_note}</small>}</span>
              <span className="fine-print">{new Date(a.created_at).toLocaleDateString(fr ? 'fr-CM' : 'en-CM')}</span>
            </div>
          ))}
        </section>
      )}

      <form className="portal-form mt-8" onSubmit={onSubmit} noValidate>
        <h2>{t('Loan request', 'Demande')}</h2>
        <div className="translation-columns">
          {field('membership_number', t('Membership number', 'Numéro de membre'), { required: true, max: 40 })}
          {field('amount', t('Amount (FCFA)', 'Montant (FCFA)'), { required: true, type: 'number' })}
          {field('term_months', t('Repayment term (months)', 'Durée de remboursement (mois)'), { required: true, type: 'number' })}
        </div>
        <label className="field">{t('Purpose of the loan', 'Objet du prêt')} *<textarea name="purpose" required maxLength={1000} rows={3} /></label>

        <h2>{t('Contact details', 'Coordonnées')}</h2>
        <div className="translation-columns">
          {field('phone', t('Phone', 'Téléphone'), { required: true, type: 'tel', max: 30 })}
          {field('email', t('Email', 'E-mail'), { required: true, type: 'email', max: 255, defaultValue: user?.email ?? '' })}
          {field('address', t('Address', 'Adresse'), { max: 300 })}
        </div>

        <h2>{t('Income and employment', 'Revenus et emploi')}</h2>
        <div className="translation-columns">
          {field('monthly_income', t('Monthly income (FCFA)', 'Revenu mensuel (FCFA)'), { required: needIncome, type: 'number' })}
          {field('occupation', t('Occupation', 'Profession'), { required: needIncome })}
          {field('employer', t('Employer or business', 'Employeur ou activité'))}
        </div>

        <h2>{t('Guarantor', 'Garant')}</h2>
        <div className="translation-columns">
          {field('guarantor_name', t('Full name', 'Nom complet'), { required: needGuarantor })}
          {field('guarantor_phone', t('Phone', 'Téléphone'), { required: needGuarantor, type: 'tel', max: 30 })}
          {field('guarantor_relationship', t('Relationship', 'Lien'), { max: 80 })}
        </div>

        <label className="consent-line"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{t('I confirm the information is accurate and agree that NATINCCUL staff may use it only to review this application.', 'Je confirme l’exactitude des informations et accepte que le personnel de NATINCCUL les utilise uniquement pour examiner cette demande.')}</span>
        </label>
        <Button disabled={busy || !consent}><Send />{t('Submit application', 'Soumettre la demande')}</Button>
        {message && <p role="status" className="notice">{message}</p>}
      </form>
    </PortalShell>
  );
}
