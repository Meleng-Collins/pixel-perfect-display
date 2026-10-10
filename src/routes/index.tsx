import { createFileRoute } from '@tanstack/react-router';
import { Website } from '@/components/site/website';

export const Route = createFileRoute('/')({
  head: () => ({meta:[
    {title:'NATINCCUL COOPBOD | Build Today. Benefit Tomorrow.'},
    {name:'description',content:'Your community credit union in Douala, Cameroon. Explore savings, loans and the people behind NATINCCUL. Together, we grow stronger.'},
    {property:'og:title',content:'NATINCCUL COOPBOD | Your community credit union'},
    {property:'og:description',content:'Build today. Benefit tomorrow. Savings, loans and community financial services in Douala, Cameroon.'},
    {property:'og:type',content:'website'},
    {name:'twitter:card',content:'summary_large_image'},
  ]}),
  component: () => <Website/>,
});
