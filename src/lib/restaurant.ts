import { z } from 'zod';
export const ADDRESS = 'Ward No. 10, Masjid Chowk, Near 7th Heaven, Madhepura, Bihar 852113, India';
export const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('BLUEBERRY PARADISE, '+ADDRESS)}`;
export const PRIMARY = '917870088543';
export const ALTERNATE = '919065382322';
export const rupees = (n:number)=>`₹${n.toLocaleString('en-IN')}`;
export const checkoutSchema = z.object({name:z.string().trim().min(1,'Please enter your name.').max(120),notes:z.string().trim().max(2000),fulfillment:z.enum(['takeaway','delivery']),address:z.string().trim().max(500)}).refine(v=>v.fulfillment!=='delivery'||v.address.length>5,{message:'Please enter your delivery address.',path:['address']});
export type CartLine = {key:string;itemId:string;name:string;variant:string;price:number|null;quantity:number};
export const cartLinesSchema = z.array(z.object({key:z.string().max(180),itemId:z.string().max(100),name:z.string().max(180),variant:z.string().max(80),price:z.number().min(0).max(100000).nullable(),quantity:z.number().int().min(1).max(99)})).max(100);
export const subtotal=(lines:CartLine[])=>lines.reduce((sum,l)=>sum+(l.price??0)*l.quantity,0);
export function orderMessage(lines:CartLine[], customer:z.infer<typeof checkoutSchema>) {
 const c=checkoutSchema.parse(customer); const safe=cartLinesSchema.min(1).parse(lines);
 return ['BLUEBERRY PARADISE — Order request',`Customer: ${c.name}`,`Service: ${c.fulfillment}`,c.address?`Address: ${c.address}`:'','',...safe.map(l=>`${l.quantity} × ${l.name}${l.variant?` (${l.variant})`:''} — ${l.price===null?'Ask for price':rupees(l.price*l.quantity)}`),'',`Known-price subtotal: ${rupees(subtotal(safe))}`,safe.some(l=>l.price===null)?'Unpriced items need a quote.':'', 'Delivery charges, availability and final total to be confirmed.',c.notes?`Notes: ${c.notes}`:'','This is a request, not a confirmed order. Please confirm.'].filter(Boolean).join('\n');
}
export const whatsappUrl=(text:string,phone=PRIMARY)=>`https://wa.me/${phone}?text=${encodeURIComponent(text.slice(0,16000))}`;
export const enquirySchema=z.object({kind:z.enum(['contact','cake','order']),name:z.string().trim().min(1).max(120),phone:z.string().trim().regex(/^[+\d ()-]{7,30}$/,'Enter a valid phone number.'),message:z.string().trim().max(2000),payload:z.record(z.unknown()).default({})}).refine(v=>JSON.stringify(v.payload).length<=16000,{message:'Request is too long.'});
export const seo=(title:string,description:string)=>({meta:[{title:`${title} — Blueberry Paradise`},{name:'description',content:description},{property:'og:title',content:`${title} — Blueberry Paradise`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]});
