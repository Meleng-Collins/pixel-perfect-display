import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { reviewLoansQuery, reviewLoan, saveLendingPolicy } from '@/lib/loans.functions';
import { loanStatuses, statusLabels, type LoanStatus } from '@/lib/loan-application';
import { pageHead } from '@/lib/page-head';
import { PortalShell } from '@/components/portal/shell';
import { useSession } from '@/components/portal/session';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/loan-review')({
  head: () => pageHead('Loan applications review', 'Review NATINCCUL loan applications and record decisions.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(reviewLoansQuery),
  errorComponent: () => <main className="auth-page"><h1>Access denied / Accès refusé</h1><p>Loan reviewer access is required. / Accès examinateur requis.</p><Button asChild variant="outline"><a href="/dashboard">My account / Mon compte</a></Button></main>,
  component: Review,
});

function Review() {
  const { data } = useSuspenseQuery(reviewLoansQuery);
  const { lang, roles } = useSession();
  const fr = lang === 'fr';
  const t = (en: string, f: string) => (fr ? f : en);
  const client = useQueryClient();
  const review = useServerFn(reviewLoan);
  const savePolicy = useServerFn(saveLendingPolicy);
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | LoanStatus>('all');
  const apps = data.applications.filter((a) => filter === 'all' || a.status === filter);
  const money = (n: number | null) => (n == null ? '—' : new Intl.NumberFormat(fr ? 'fr-CM' : 'en-CM').format(Number(n)) + ' FCFA');

  return (
    <PortalShell title={t('Loan applications', 'Demandes de prêt')}>
      <p className="portal-lead">{t('Decisions recorded here are the cooperative’s own; no funds are moved by this system.', 'Les décisions enregistrées ici sont celles de la coopérative ; aucun fonds n’est transféré par ce système.')}</p>

      {roles.includes('admin') && (
        <section className="portal-form mt-6">
          <h2>{t('Lending policy', 'Politique de crédit')}</h2>
          {(['require_income', 'require_guarantor'] as const).map((k) => (
            <label className="consent-line" key={k}>
              <input type="checkbox" defaultChecked={data.policy[k]} onChange={async (e) => {
                try { await savePolicy({ data: { ...data.policy, [k]: e.target.checked } }); await client.invalidateQueries({ queryKey: ['review-loans'] }); setMessage(t('Policy saved.', 'Politique enregistrée.')); } catch (err) { setMessage(err instanceof Error ? err.message : 'Error'); }
              }} />
              <span>{k === 'require_income' ? t('Require income and occupation', 'Exiger revenus et profession') : t('Require a guarantor', 'Exiger un garant')}</span>
            </label>
          ))}
        </section>
      )}

      <div className="filter-tabs my-6">
        {(['all', ...loanStatuses] as const).map((s) => (
          <Button key={s} variant={filter === s ? 'default' : 'ghost'} onClick={() => setFilter(s)}>{s === 'all' ? t('All', 'Toutes') : statusLabels[s][fr ? 1 : 0]}</Button>
        ))}
      </div>

      {!apps.length && <p className="fine-print">{t('No applications.', 'Aucune demande.')}</p>}
      {apps.map((a) => (
        <article key={a.id} className="portal-form mb-4">
          <button type="button" className="portal-list-row w-full text-left" onClick={() => setOpen(open === a.id ? null : a.id)}>
            <span><strong>{a.membership_number}</strong> · {money(a.amount)} · {a.term_months} {t('months', 'mois')}</span>
            <span>{statusLabels[a.status as LoanStatus]?.[fr ? 1 : 0]}</span>
            <span className="fine-print">{new Date(a.created_at).toLocaleDateString(fr ? 'fr-CM' : 'en-CM')}</span>
          </button>
          {open === a.id && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await review({ data: { id: a.id, status: String(f.get('status')) as LoanStatus, reviewer_note: String(f.get('note') ?? '') } });
                await client.invalidateQueries({ queryKey: ['review-loans'] });
                setMessage(t('Review saved.', 'Examen enregistré.'));
              } catch (err) { setMessage(err instanceof Error ? err.message : 'Error'); }
            }}>
              <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                <div><dt className="fine-print">{t('Purpose', 'Objet')}</dt><dd>{a.purpose}</dd></div>
                <div><dt className="fine-print">{t('Contact', 'Contact')}</dt><dd>{a.phone} · {a.email}{a.address && ` · ${a.address}`}</dd></div>
                <div><dt className="fine-print">{t('Income', 'Revenus')}</dt><dd>{money(a.monthly_income)} · {a.occupation || '—'}{a.employer && ` · ${a.employer}`}</dd></div>
                <div><dt className="fine-print">{t('Guarantor', 'Garant')}</dt><dd>{a.guarantor_name || '—'} {a.guarantor_phone} {a.guarantor_relationship && `(${a.guarantor_relationship})`}</dd></div>
              </dl>
              <div className="translation-columns mt-4">
                <label className="field">{t('Status', 'État')}<select name="status" defaultValue={a.status}>{loanStatuses.map((s) => <option key={s} value={s}>{statusLabels[s][fr ? 1 : 0]}</option>)}</select></label>
                <label className="field">{t('Note shown to applicant', 'Note visible par le demandeur')}<textarea name="note" rows={3} maxLength={2000} defaultValue={a.reviewer_note} /></label>
              </div>
              <Button className="mt-3">{t('Save review', 'Enregistrer')}</Button>
            </form>
          )}
        </article>
      ))}
      {message && <p role="status" className="notice mt-6">{message}</p>}
    </PortalShell>
  );
}
