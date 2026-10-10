import { useState } from 'react';
import { Printer, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateLoan } from '@/lib/loan';
import type { Language } from './content';

export function LoanCalculator({ lang }: { lang: Language }) {
  const fr = lang === 'fr';
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(0);
  const [months, setMonths] = useState(12);
  const [fees, setFees] = useState(0);
  const [date, setDate] = useState('');
  const result = calculateLoan(principal, rate, months, fees);
  const format = (n: number) => `${Math.round(n).toLocaleString(fr ? 'fr-FR' : 'en-GB')} XAF`;
  const fields = [
    { label: fr ? 'Montant du prêt (XAF)' : 'Loan amount (XAF)', value: principal, set: setPrincipal, min: 1 },
    { label: fr ? 'Taux annuel indicatif (%)' : 'Your illustrative annual rate (%)', value: rate, set: setRate, min: 0 },
    { label: fr ? 'Durée (mois)' : 'Duration (months)', value: months, set: setMonths, min: 1 },
    { label: fr ? 'Frais indicatifs (XAF)' : 'Illustrative fees (XAF)', value: fees, set: setFees, min: 0 },
  ];
  return <div className="calculator">
    <div className="calculator-inputs"><span className="eyebrow">{fr ? 'PLANIFIEZ VOTRE PROJET' : 'PLAN YOUR NEXT STEP'}</span><h2>{fr ? 'Votre estimation de prêt' : 'Your loan estimate'}</h2><p>{fr ? 'Saisissez vos propres hypothèses. Aucun taux officiel n’est proposé ici.' : 'Enter your own assumptions. No official lending rate is offered here.'}</p>
      <div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <label className="field" key={field.label}>{field.label}<Input type="number" min={field.min} step={field.set === setRate ? '0.1' : '1'} value={field.value} onChange={e => field.set(Number(e.target.value))} /></label>)}<label className="field">{fr ? 'Date de début' : 'Start date'}<Input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><div className="field">{fr ? 'Fréquence de paiement' : 'Payment frequency'}<div className="input-static">{fr ? 'Mensuelle · Mensualités constantes' : 'Monthly · Equal installments'}</div></div></div>
    </div>
    <div className="calculator-result"><span className="eyebrow">{fr ? 'MENSUALITÉ ESTIMÉE' : 'ESTIMATED MONTHLY PAYMENT'}</span><strong>{result ? format(result.payment) : '—'}</strong>{result ? <dl><div><dt>{fr ? 'Capital' : 'Principal'}</dt><dd>{format(principal)}</dd></div><div><dt>{fr ? 'Total des intérêts' : 'Total interest'}</dt><dd>{format(result.interest)}</dd></div><div><dt>{fr ? 'Frais' : 'Fees'}</dt><dd>{format(fees)}</dd></div><div className="total"><dt>{fr ? 'Montant total à payer' : 'Total payable'}</dt><dd>{format(result.payable)}</dd></div></dl> : <p role="alert">{fr ? 'Vérifiez les montants et la durée (1 à 600 mois).' : 'Check your amounts and duration (1–600 months).'}</p>}<p className="fine-print">{fr ? 'Estimation uniquement, sans engagement ni approbation de prêt. Les conditions définitives sont soumises à l’examen de NATINCCUL.' : 'An estimate only, not a binding offer or loan approval. Final terms are subject to NATINCCUL’s review.'}</p><Button variant="secondary" onClick={() => window.print()}><Printer />{fr ? 'Imprimer l’estimation' : 'Print estimate'}</Button><Button asChild variant="link" className="text-primary-foreground"><a href={`/${lang}/contact`}>{fr ? 'Parler à un conseiller' : 'Talk to our team'}<ArrowUpRight /></a></Button></div>
    {result && <div className="repayment"><h3>{fr ? 'Échéancier de remboursement' : 'Repayment schedule'}</h3><div className="table-scroll"><table><thead><tr>{[fr ? 'Échéance' : 'Installment', fr ? 'Paiement (XAF)' : 'Payment (XAF)', fr ? 'Capital' : 'Principal', fr ? 'Intérêts' : 'Interest', fr ? 'Solde' : 'Balance'].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{result.rows.map(row => { let due = String(row.month); if(date) {const d = new Date(`${date}T12:00:00`); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth()+row.month); const end = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); d.setDate(Math.min(day,end)); due = d.toLocaleDateString(fr ? 'fr-FR' : 'en-GB');} return <tr key={row.month}><td>{due}</td><td>{Math.round(row.payment).toLocaleString()}</td><td>{Math.round(row.principal).toLocaleString()}</td><td>{Math.round(row.interest).toLocaleString()}</td><td>{Math.round(row.balance).toLocaleString()}</td></tr>;})}</tbody></table></div></div>}
  </div>;
}