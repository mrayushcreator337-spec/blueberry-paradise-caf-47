import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { fallbackCategories, fallbackItems } from './catalog';
import { enquirySchema } from './restaurant';
export const getContent=createServerFn({method:'GET'}).handler(async()=>{
 try {
 const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const url=process.env['SUPABASE_URL'];
 if(!key||!url) throw new Error('Not configured');
 const db=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const [c,i,g,s]=await Promise.all([db.from('menu_categories').select('*').eq('is_active',true).order('sort_order'),db.from('menu_items').select('*').eq('is_available',true).order('sort_order'),db.from('gallery_images').select('*').eq('is_active',true).order('sort_order'),db.from('site_settings').select('*')]);
 if(c.error||i.error||g.error||s.error) throw new Error('Content unavailable');
 return {categories:c.data,items:i.data,gallery:g.data,settings:s.data,fallback:false};
 }catch{return {categories:fallbackCategories,items:fallbackItems,gallery:[],settings:[],fallback:true};}
});
export const submitEnquiry=createServerFn({method:'POST'}).inputValidator((data:unknown)=>enquirySchema.parse(data)).handler(async({data})=>{
 const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const url=process.env['SUPABASE_URL'];if(!key||!url)throw new Error('Please contact us on WhatsApp.');
 const db=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const {error}=await db.from('enquiries').insert({...data,payload:JSON.parse(JSON.stringify(data.payload)),status:'new'});if(error)throw new Error('Could not save your request. Please use WhatsApp.');return {ok:true};
});
