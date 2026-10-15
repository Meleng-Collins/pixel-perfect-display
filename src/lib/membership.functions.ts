import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { documentSchema, membershipSchema, documentLimit } from './membership';
export const membershipQuery = { queryKey: ['membership'], queryFn: () => getMembership() };
export const getMembership = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const [request,documents] = await Promise.all([context.supabase.from('membership_requests').select('*').eq('user_id',context.userId).maybeSingle(),context.supabase.from('member_documents').select('*').eq('user_id',context.userId).order('created_at',{ascending:false})]);
 if(request.error || documents.error) throw new Error('Membership could not be loaded');
 return {request:request.data,documents:documents.data ?? []};
});
export const saveMembership = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(membershipSchema).handler(async ({data,context}) => {
 const {error} = await context.supabase.from('membership_requests').upsert({...data,user_id:context.userId});
 if(error) throw new Error('Membership request could not be saved'); return {ok:true};
});
export const registerDocument = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(documentSchema).handler(async ({data,context}) => {
 const match = data.object_path.match(/^([0-9a-f-]{36})\/([0-9a-f-]{36})\.(pdf|jpeg|png|webp)$/);
 if(!match || match[1] !== context.userId) throw new Error('Invalid document path');
 const {data:files,error:lookupError} = await context.supabase.storage.from('member-documents').list(context.userId,{search:`${match[2]}.${match[3]}`});
 const file = files?.find(f=>f.name===`${match[2]}.${match[3]}`);
 if(lookupError || !file || Number(file.metadata?.size)!==data.size_bytes || file.metadata?.mimetype!==data.mime_type || data.size_bytes>documentLimit) throw new Error('Document verification failed');
 const {error} = await context.supabase.from('member_documents').insert({...data,user_id:context.userId});
 if(error) throw new Error('Document could not be recorded'); return {ok:true};
});
export const openDocument = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.string().uuid()).handler(async ({data,context}) => {
 const {data:doc,error} = await context.supabase.from('member_documents').select('object_path').eq('id',data).single();
 if(error || !doc) throw new Error('Document unavailable');
 return {object_path:doc.object_path};
});
export const deleteDocument = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.string().uuid()).handler(async ({data,context}) => {
 const {data:doc} = await context.supabase.from('member_documents').select('object_path').eq('id',data).eq('user_id',context.userId).single();
 if(!doc) throw new Error('Document unavailable');
 const removed = await context.supabase.storage.from('member-documents').remove([doc.object_path]);
 if(removed.error) throw new Error('Document could not be deleted');
 const {error} = await context.supabase.from('member_documents').delete().eq('id',data).eq('user_id',context.userId);
 if(error) throw new Error('Document record could not be deleted'); return {ok:true};
});