import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
const itemSchema=z.object({id:z.string().uuid().optional(),category_id:z.string().uuid(),name:z.string().trim().min(1).max(180),description:z.string().max(2000).nullable(),prices:z.array(z.number().min(0).max(100000)).max(6),is_available:z.boolean(),image_url:z.string().url().refine(v=>v.startsWith('https://')).nullable(),sort_order:z.number().int().min(0).max(10000),is_featured:z.boolean()});
const categorySchema=z.object({id:z.string().uuid().optional(),slug:z.string().regex(/^[a-z0-9-]+$/).max(80),name:z.string().trim().min(1).max(120),description:z.string().max(2000).nullable(),price_labels:z.array(z.string().max(80)).max(6),sort_order:z.number().int().min(0).max(10000),is_active:z.boolean()});
const gallerySchema=z.object({id:z.string().uuid().optional(),url:z.string().url().refine(v=>v.startsWith('https://')),alt:z.string().trim().min(1).max(300),caption:z.string().max(500).nullable(),sort_order:z.number().int().min(0).max(10000),is_active:z.boolean()});
export const adminQueryFn=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:role,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(error||!role)return {allowed:false as const};
 const [c,i,g,s,e]=await Promise.all([context.supabase.from('menu_categories').select('*').order('sort_order'),context.supabase.from('menu_items').select('*').order('sort_order'),context.supabase.from('gallery_images').select('*').order('sort_order'),context.supabase.from('site_settings').select('*'),context.supabase.from('enquiries').select('*').order('created_at',{ascending:false}).limit(200)]);if(c.error||i.error||g.error||s.error||e.error)throw new Error('Could not load admin content.');return {allowed:true as const,categories:c.data,items:i.data,gallery:g.data,settings:s.data,enquiries:e.data};
});
const mutationSchema=z.discriminatedUnion('kind',[z.object({kind:z.literal('item'),value:itemSchema}),z.object({kind:z.literal('category'),value:categorySchema}),z.object({kind:z.literal('gallery'),value:gallerySchema}),z.object({kind:z.literal('setting'),value:z.object({key:z.enum(['hours','announcement','contact']),value:z.record(z.unknown()).refine(v=>JSON.stringify(v).length<10000)})}),z.object({kind:z.literal('status'),value:z.object({id:z.string().uuid(),status:z.enum(['new','reviewed','closed'])})})]);
export const saveAdmin=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:unknown)=>mutationSchema.parse(data)).handler(async({context,data})=>{
 const {data:role,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(error||!role)throw new Error('Administrator access required.');
 let result;
 if(data.kind==='item'){const {id,...v}=data.value;result=id?await context.supabase.from('menu_items').update(v).eq('id',id):await context.supabase.from('menu_items').insert(v);}
 else if(data.kind==='category'){const {id,...v}=data.value;result=id?await context.supabase.from('menu_categories').update(v).eq('id',id):await context.supabase.from('menu_categories').insert(v);}
 else if(data.kind==='gallery'){const {id,...v}=data.value;result=id?await context.supabase.from('gallery_images').update(v).eq('id',id):await context.supabase.from('gallery_images').insert(v);}
 else if(data.kind==='setting')result=await context.supabase.from('site_settings').upsert({key:data.value.key,value:JSON.parse(JSON.stringify(data.value.value)),updated_at:new Date().toISOString()});
 else result=await context.supabase.from('enquiries').update({status:data.value.status}).eq('id',data.value.id);
 if(result.error)throw new Error('Could not save. Check values and try again.');return {ok:true};
});
