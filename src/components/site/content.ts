import president from "@/assets/president-office.jpg";
import gathering from '@/assets/IMG-20261010-WA0061.jpg.asset.json';
import celebration from '@/assets/IMG-20261010-WA0062.jpg.asset.json';
import members from '@/assets/IMG-20261010-WA0064.jpg.asset.json';
import council from '@/assets/IMG-20261010-WA0073.jpg.asset.json';
import meeting from '@/assets/IMG-20261010-WA0074.jpg.asset.json';
import office from '@/assets/IMG-20261010-WA0075.jpg.asset.json';
import mobileMoney from '@/assets/IMG-20261010-WA0076.jpg.asset.json';
import serviceTeam from '@/assets/IMG-20261010-WA0082.jpg.asset.json';
import visits from '@/assets/IMG-20261010-WA0090.jpg.asset.json';
import logo from '@/assets/IMG-20261010-WA0049.jpg.asset.json';
import savings from '@/assets/IMG-20261010-WA0051.jpg.asset.json';
import referral from '@/assets/IMG-20261010-WA0053.jpg.asset.json';
import team from '@/assets/IMG-20261010-WA0063.jpg.asset.json';
import member from '@/assets/IMG-20261010-WA0065.jpg.asset.json';
import market from '@/assets/IMG-20261010-WA0079.jpg.asset.json';
import outreach from '@/assets/IMG-20261010-WA0080.jpg.asset.json';
import staff from '@/assets/IMG-20261010-WA0086.jpg.asset.json';
import walk from '@/assets/IMG-20261010-WA0087.jpg.asset.json';
import brochure from '@/assets/IMG-20261010-WA0092.jpg.asset.json';

export type Language = 'en' | 'fr';
export const assets = { logo, savings, referral, team, member, market, outreach, staff, walk, brochure, president, gathering, celebration, members, council, meeting, office, mobileMoney, serviceTeam, visits };
export const pages = ['home', 'about', 'services', 'savings', 'loans', 'activities', 'news', 'membership', 'contact', 'legal'] as const;
export type Page = typeof pages[number];
export const labels: Record<Page, [string, string]> = {
  home: ['Home', 'Accueil'], about: ['About us', 'À propos'], services: ['Our services', 'Nos services'], savings: ['Savings & investments', 'Épargne et investissements'], loans: ['Loans', 'Prêts'], activities: ['Our community', 'Notre communauté'], news: ['News & updates', 'Actualités'], membership: ['Become a member', 'Devenir membre'], contact: ['Contact us', 'Contactez-nous'], legal: ['Privacy & terms', 'Confidentialité et conditions'],
};
export const photos = [
  { asset: gathering, category: 'events', title: ['Sharing a cooperative moment', 'Un moment de partage coopératif'] },
  { asset: celebration, category: 'events', title: ['Together at our gathering', 'Ensemble lors de notre rencontre'] },
  { asset: members, category: 'events', title: ['Our cooperative community', 'Notre communauté coopérative'] },
  { asset: council, category: 'events', title: ['Cooperative discussions', 'Échanges coopératifs'] },
  { asset: meeting, category: 'events', title: ['Meeting with our community', 'Rencontre avec notre communauté'] },
  { asset: office, category: 'team', title: ['A welcoming face at our office', 'Un accueil chaleureux en agence'] },
  { asset: mobileMoney, category: 'outreach', title: ['Everyday services close to you', 'Des services quotidiens près de vous'] },
  { asset: serviceTeam, category: 'team', title: ['Our team, ready to welcome you', 'Notre équipe vous accueille'] },
  { asset: visits, category: 'outreach', title: ['Connecting in the neighbourhood', 'Des rencontres dans le quartier'] },

  { asset: team, category: 'events', title: ['The people behind NATINCCUL', 'Les visages de NATINCCUL'] },
  { asset: outreach, category: 'outreach', title: ['Connecting with our community', 'À la rencontre de notre communauté'] },
  { asset: staff, category: 'team', title: ['A team committed to you', 'Une équipe à votre service'] },
  { asset: member, category: 'events', title: ['Celebrating our cooperative', 'Célébrons notre coopérative'] },
  { asset: market, category: 'outreach', title: ['Meeting local entrepreneurs', 'Rencontres avec les entrepreneurs locaux'] },
  { asset: walk, category: 'outreach', title: ['Out in the neighbourhood', 'Au cœur du quartier'] },
];
export const services = [
  { icon: 'savings', title: ['Save with purpose', 'Épargnez pour demain'], body: ['From everyday savings to long-term goals, take the next step towards your future.', 'De votre épargne quotidienne à vos projets à long terme, préparez votre avenir.'], page: 'savings' },
  { icon: 'loans', title: ['Move your plans forward', 'Faites avancer vos projets'], body: ['Explore financing for your business, agriculture and personal needs.', 'Découvrez des solutions de financement pour vos besoins personnels, agricoles et professionnels.'], page: 'loans' },
  { icon: 'payments', title: ['Stay connected to your money', 'Restez proche de votre argent'], body: ['Mobile money, money transfers and everyday payment services, close to home.', 'Mobile money, transferts d’argent et services de paiement, près de chez vous.'], page: 'services' },
] as const;