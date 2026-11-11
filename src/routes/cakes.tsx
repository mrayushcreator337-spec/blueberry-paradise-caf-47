import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { contentQuery } from '@/lib/content-query';
import { seo } from '@/lib/restaurant';
import { cakeFlavours } from '@/lib/catalog';
import cake from '@/assets/cake.jpg';
import { PageTitle,ContentError,ContentNotFound } from '@/components/site/page';
import { MenuBrowser } from '@/components/site/menu-browser';
import { EnquiryForm } from '@/components/site/enquiry-form';
export const Route=createFileRoute('/cakes')({loader:({context})=>context.queryClient.ensureQueryData(contentQuery),head:()=>seo('Cakes & Custom Orders','Explore half-kg and 1-kg celebration cakes, flavours and custom cake enquiries in Madhepura.'),errorComponent:ContentError,notFoundComponent:ContentNotFound,component:Cakes});
function Cakes(){const {data}=useSuspenseQuery(contentQuery);const categories=data.categories.filter(c=>c.slug==='cakes');return <main><div className="container-site"><PageTitle eyebrow="A little sweeter, a little more special" title="Cakes & celebrations"><p>From classic flavours to custom shapes. Tell us what you're celebrating.</p></PageTitle><img src={cake} alt="Sample celebration cake with blueberry decoration" className="my-8 max-h-96 w-full rounded-lg object-cover"/><p className="text-xs text-muted-foreground">Sample food photography; actual designs may differ.</p><MenuBrowser categories={categories} items={data.items.filter(i=>categories.some(c=>c.id===i.category_id)).map(i=>({...i,description:i.description??cakeFlavours[i.name]??null}))} search="" category="all" onSearch={()=>{}} onCategory={()=>{}}/></div><section className="bg-secondary"><div className="container-site grid gap-10 py-14 md:grid-cols-2"><div><p className="eyebrow text-berry">Made for your occasion</p><h2 className="mt-3 text-3xl">Let's talk cake</h2><p className="mt-4 text-muted-foreground">Share the flavour, weight, date and design you have in mind. Custom shapes are available by enquiry; lead time and final price require confirmation.</p></div><EnquiryForm kind="cake"/></div></section></main>;}
