import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';

export const portalQuery = { queryKey:['portal'],queryFn:()=>getPortal() };
export const getPortal=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const [profile,roles,requests]=await Promise.all([context.supabase.from('profiles').select('*').eq('id',context.userId).maybeSingle(),context.supabase.from('user_roles').select('role'),context.supabase.from('account_requests').select('id,kind,status,created_at').order('created_at',{ascending:false})]);
  if(profile.error||roles.error||requests.error)throw new Error('Account could not be loaded');
  return {profile:profile.data,roles:roles.data?.map(r=>r.role)??[],requests:requests.data??[]};
});
export const saveProfile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({full_name:z.string().trim().max(160),preferred_language:z.enum(['en','fr']),avatar_path:z.string().max(500).nullable()})).handler(async({data,context})=>{
  if(data.avatar_path&&!data.avatar_path.startsWith(context.userId+'/'))throw new Error('Invalid avatar');
  const {error}=await context.supabase.from('profiles').update(data).eq('id',context.userId);if(error)throw new Error('Profile could not be saved');return {ok:true};
});
export const requestAccountAction=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.enum(['export','deletion'])).handler(async({data,context})=>{const {error}=await context.supabase.from('account_requests').insert({user_id:context.userId,kind:data});if(error)throw new Error('Request could not be saved');return {ok:true};});

export const adminQuery={queryKey:['admin-content'],queryFn:()=>getAdminContent()};
export const getAdminContent=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  const {data:editor}=await context.supabase.rpc('has_permission',{_permission:'content.write'});
  if(!admin&&!editor)throw new Error('Access denied');
  const {data:entries,error}=await context.supabase.from('content_entries').select('*').order('updated_at',{ascending:false});if(error)throw new Error('Content could not be loaded');
  const {data:logs}=admin?await context.supabase.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(30):{data:[]};
  const {data:requests}=admin?await context.supabase.from('account_requests').select('id,kind,status,created_at').order('created_at',{ascending:false}).limit(30):{data:[]};
  return {entries:entries??[],logs:logs??[],requests:requests??[],admin:Boolean(admin)};
});
const contentSchema=z.object({id:z.string().uuid().optional(),page:z.enum(['home','about','services','savings','loans','activities','news','membership','contact','legal']),title_en:z.string().trim().min(1).max(180),title_fr:z.string().trim().min(1).max(180),body_en:z.string().trim().min(1).max(20000),body_fr:z.string().trim().min(1).max(20000),status:z.enum(['draft','published'])});
export const saveContent=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(contentSchema).handler(async({data,context})=>{
  const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});const {data:editor}=await context.supabase.rpc('has_permission',{_permission:'content.write'});if(!admin&&!editor)throw new Error('Access denied');
  const {id,...fields}=data;const result=id?await context.supabase.from('content_entries').update(fields).eq('id',id):await context.supabase.from('content_entries').insert({...fields,created_by:context.userId});if(result.error)throw new Error('Content could not be saved');return {ok:true};
});
export const removeContent=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.string().uuid()).handler(async({data,context})=>{const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Access denied');const {error}=await context.supabase.from('content_entries').delete().eq('id',data);if(error)throw new Error('Content could not be deleted');return {ok:true};});
export const getPublishedContent=createServerFn({method:'GET'}).handler(async()=>{
  const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];if(!url||!key)throw new Error('Content connection unavailable');
  const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_')&&headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
  const {data,error}=await client.from('content_entries').select('id,page,title_en,title_fr,body_en,body_fr').eq('status','published').order('updated_at');if(error)throw new Error('Published content unavailable');return data??[];
});
export const publishedQuery={queryKey:['published-content'],queryFn:()=>getPublishedContent()};