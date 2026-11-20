import { Link,useRouter } from '@tanstack/react-router';
import { useEffect,useState,type ReactNode } from 'react';
import { Menu,X,ShoppingBag,Phone,MessageCircle,MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './cart';
import { ADDRESS,MAPS } from '@/lib/restaurant';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
const nav=[['/','Home'],['/menu','Menu'],['/cakes','Cakes'],['/gallery','Gallery'],['/about','About'],['/contact','Find us'],['/faqs','FAQs']] as const;
export function SiteShell({children}:{children:ReactNode}){
 const [expanded,setExpanded]=useState(false);const [signedIn,setSignedIn]=useState(false);const cart=useCart();const router=useRouter();const qc=useQueryClient();
  useEffect(() => {
    if (
      !import.meta.env["VITE_SUPABASE_URL"] ||
      !import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]
    )
      return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      setSignedIn(Boolean(session));
      void router.invalidate();
      if (event !== "SIGNED_OUT") void qc.invalidateQueries();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [router, qc]);
 return <><a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a><header className="sticky top-0 z-40 border-b border-navy-foreground/15 bg-navy text-navy-foreground"><div className="container-site flex h-20 items-center justify-between gap-3"><Link to="/" className="leading-tight"><span className="block font-display text-xl md:text-2xl">Blueberry Paradise<span className="text-honey">.</span></span><span className="text-[10px] uppercase tracking-normal text-navy-foreground/65">Restaurant & bakery · Madhepura</span></Link><nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">{nav.map(([to,label])=><Link key={to} to={to} activeProps={{className:'text-honey'}} activeOptions={{exact:true}} className="text-sm transition-colors hover:text-honey">{label}</Link>)}</nav><div className="flex items-center gap-2"><Button variant="outlineLight" onClick={cart.open} aria-label="Open cart"><ShoppingBag/><span>{cart.lines.reduce((s,l)=>s+l.quantity,0)}</span></Button><Button variant="outlineLight" size="icon" className="lg:hidden" aria-label={expanded?'Close navigation':'Open navigation'} onClick={()=>setExpanded(!expanded)}>{expanded?<X/>:<Menu/>}</Button></div></div>{expanded&&<nav aria-label="Mobile navigation" className="container-site grid grid-cols-2 gap-4 border-t border-navy-foreground/20 py-5 lg:hidden">{nav.map(([to,label])=><Link to={to} key={to} onClick={()=>setExpanded(false)}>{label}</Link>)}</nav>}</header><div id="main-content">{children}</div><footer className="bg-navy-deep text-navy-foreground"><div className="container-site grid gap-10 py-12 md:grid-cols-3"><div><h2 className="text-2xl">Blueberry Paradise</h2><p className="mt-2 font-display italic text-honey">Where Taste Meets Love</p><p className="mt-5 text-sm text-navy-foreground/70">{ADDRESS}</p></div><div className="space-y-3"><a className="flex items-center gap-2" href="tel:+917870088543"><Phone size={16}/>+91 7870088543</a><a className="flex items-center gap-2" href="tel:+919065382322"><Phone size={16}/>+91 9065382322</a><a className="flex items-center gap-2" href="https://wa.me/917870088543"><MessageCircle size={16}/>Order on WhatsApp</a><a className="flex items-center gap-2" href={MAPS} target="_blank" rel="noreferrer"><MapPin size={16}/>Get directions</a></div><div><p className="text-sm text-navy-foreground/70">Listed services: dine-in, takeaway, delivery & drive-through. Please confirm availability and today's hours by phone.</p><p className="mt-5 text-sm text-navy-foreground/70">Orders are requests until restaurant confirmation.</p><Button asChild variant="outlineLight" className="mt-5"><Link to={signedIn?'/admin':'/auth'}>{signedIn?'Admin account':'Admin sign in'}</Link></Button></div></div><div className="container-site border-t border-navy-foreground/15 py-5 text-xs text-navy-foreground/60">BLUEBERRY PARADISE · Madhepura, Bihar</div></footer></>;
}
