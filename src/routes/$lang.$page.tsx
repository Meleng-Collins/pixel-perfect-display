import { createFileRoute, notFound } from '@tanstack/react-router';
import { Website } from '@/components/site/website';
import { labels, pages, type Language, type Page } from '@/components/site/content';
import { publishedQuery } from '@/lib/portal.functions';

export const Route = createFileRoute('/$lang/$page')({
  loader:({context,params})=>{if(!['en','fr'].includes(params.lang)||!pages.includes(params.page as Page))throw notFound();return context.queryClient.ensureQueryData(publishedQuery);},
  head: ({params}) => {
    const title = `${labels[params.page as Page]?.[params.lang==='fr'?1:0] ?? 'NATINCCUL'} | NATINCCUL COOPBOD`;
    const description = params.lang==='fr'?'NATINCCUL à Douala : épargne, prêts et services financiers de proximité. Ensemble, nous sommes plus forts.':'NATINCCUL in Douala: community savings, loans and financial services. Together, we grow stronger.';
    return {meta:[{title},{name:'description',content:description},{property:'og:title',content:title},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};
  },
  component: PageRoute,
});
function PageRoute(){const {lang,page}=Route.useParams();return <Website lang={lang as Language} page={page as Page}/>;}