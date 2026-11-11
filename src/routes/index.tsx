import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import cake from "@/assets/cake.jpg";
import spread from "@/assets/spread.jpg";
import pastries from "@/assets/pastries.jpg";
import { contentQuery } from '@/lib/content-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ContentError, ContentNotFound } from '@/components/site/page';

const ADDRESS = "Ward No. 10, Masjid Chowk, Near 7th Heaven, Madhepura, Bihar 852113, India";
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("BLUEBERRY PARADISE, " + ADDRESS)}`;

export const Route = createFileRoute("/")({
  loader: ({context}) => context.queryClient.ensureQueryData(contentQuery),
  errorComponent: ContentError,
  notFoundComponent: ContentNotFound,
  head: () => ({
    meta: [
      { title: "Blueberry Paradise — Restaurant & Bakery in Madhepura" },
      { name: "description", content: "Pizza, momos, shakes, pastries and celebration cakes at Masjid Chowk, Madhepura. Order on WhatsApp." },
      { property: "og:title", content: "Blueberry Paradise — Where Taste Meets Love" },
      { property: "og:description", content: "Restaurant & bakery in Madhepura, Bihar. Order on WhatsApp or call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Restaurant", name: "BLUEBERRY PARADISE",
        telephone: ["+917870088543", "+919065382322"],
        servesCuisine: ["Fast food", "Bakery", "Cafe"],
        address: { "@type": "PostalAddress", streetAddress: "Ward No. 10, Masjid Chowk, Near 7th Heaven", addressLocality: "Madhepura", addressRegion: "Bihar", postalCode: "852113", addressCountry: "IN" },
      }),
    }],
  }),
  component: Index,
});

const highlights = [
  { img: spread, title: "Pizza, momos & fries", text: "8\" pizzas from ₹150, momos from ₹80." },
  { img: pastries, title: "Pastries & treats", text: "Cupcakes ₹21, brownies ₹50, macarons ₹50." },
  { img: cake, title: "Celebration cakes", text: "Classic cakes from ₹300 / half kg. Custom shapes on enquiry." },
];

function Index() {
  const {data} = useSuspenseQuery(contentQuery);
  const announcement = data.settings.find(s=>s.key==='announcement')?.value;
  const notice = announcement && typeof announcement==='object' && !Array.isArray(announcement) && announcement.active===true && typeof announcement.text==='string' ? announcement.text : '';
  return (
    <main>
      {notice && <p className="bg-berry px-5 py-3 text-center text-sm text-berry-foreground">{notice}</p>}
      <section className="relative min-h-[70svh] overflow-hidden bg-navy-deep text-navy-foreground">
        <img src={hero} alt="Blueberry cheesecake and cappuccino" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="container-site relative flex min-h-[70svh] flex-col justify-center py-14 md:py-20">
          <p className="eyebrow animate-rise text-honey">Restaurant · Bakery · Café — Madhepura</p>
          <h1 className="animate-rise mt-4 max-w-2xl text-5xl font-semibold leading-[1.05] md:text-7xl">Blueberry Paradise</h1>
          <p className="animate-rise mt-4 font-display text-2xl italic text-honey">Where Taste Meets Love</p>
          <div className="animate-rise mt-10 flex flex-wrap gap-3">
            <Button asChild variant="cream" size="lg"><Link to="/menu">Explore the menu</Link></Button>
            <Button asChild variant="whatsapp" size="lg"><a href="https://wa.me/917870088543"><MessageCircle /> Order on WhatsApp</a></Button>
            <Button asChild variant="cream" size="lg"><a href="tel:+917870088543"><Phone /> Call Now</a></Button>
            <Button asChild variant="outlineLight" size="lg"><a href={MAPS} target="_blank" rel="noreferrer"><MapPin /> Get Directions</a></Button>
          </div>
          <p className="mt-8 max-w-md text-sm text-navy-foreground/75">
            Google profile snapshot (owner-provided): 4.3/5 from 54 reviews · ₹200–₹1,000 · listed as closing 10 pm — please call to confirm today's hours.
          </p>
        </div>
      </section>

      <section className="container-site py-20">
        <p className="eyebrow text-berry">From our kitchen</p>
        <h2 className="mt-2 text-4xl font-semibold">Something for every craving</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((h) => (
            <article key={h.title} className="overflow-hidden rounded-lg bg-card shadow-soft transition hover:shadow-lift">
              <img src={h.img} alt={h.title} loading="lazy" width={1200} height={900} className="aspect-[4/3] w-full object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{h.title}</h3>
                <p className="mt-2 text-muted-foreground">{h.text}</p>
                <Button asChild variant="link" className="mt-3 px-0"><Link to={h.title==='Celebration cakes'?'/cakes':'/menu'}>Take a look →</Link></Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-navy-gradient text-navy-foreground">
        <div className="container-site grid gap-8 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Find us</h2>
            <p className="mt-3 text-navy-foreground/80">{ADDRESS}</p>
            <p className="mt-3 text-sm text-navy-foreground/70">Listed service options: dine-in, takeaway, delivery, drive-through. Please call to check what's available today.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Button asChild variant="whatsapp" size="lg"><a href="https://wa.me/919065382322"><MessageCircle /> WhatsApp +91 90653 82322</a></Button>
            <Button asChild variant="cream" size="lg"><a href="tel:+919065382322"><Phone /> Call +91 90653 82322</a></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
