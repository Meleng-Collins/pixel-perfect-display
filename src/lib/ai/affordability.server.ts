import { createClient } from '@supabase/supabase-js';
import { APICallError } from 'ai';
import type { Database } from '@/integrations/supabase/types';
import { affordabilitySchema,compareScenarios } from '@/lib/affordability';
import { createResponsesCall } from './responses.server.ts';

export async function handleAffordability(request:Request):Promise<Response>{
 const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const aiKey=process.env['LOVABLE_API_KEY'];const authorization=request.headers.get('authorization');
 if(!url||!key||!aiKey)return Response.json({message:'AI service configuration is unavailable.'},{status:503});
 if(!authorization?.startsWith('Bearer '))return Response.json({message:'Sign in to request AI guidance.'},{status:401});
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:authorization},fetch:(input,init)=>{const headers=new Headers(init?.headers);headers.set('apikey',key);return fetch(input,{...init,headers});}}});
 const {data:{user},error}=await client.auth.getUser(authorization.slice(7));if(error||!user)return Response.json({message:'Sign in to request AI guidance.'},{status:401});
 let input;try{input=affordabilitySchema.parse(await request.json());}catch{return Response.json({message:'Enter a valid amount, term, monthly budget and assumed rate.'},{status:400});}
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:state,error:stateError}=await supabaseAdmin.from('ai_access_state').select('blocked,status,message').eq('id','affordability').maybeSingle();if(stateError)return Response.json({message:'AI access could not be checked.'},{status:503});
 if(state?.blocked)return Response.json({message:state.message??'AI access is paused. Contact the site administrator.'},{status:state.status??403});
 const {data:reserved,error:reserveError}=await client.rpc('reserve_ai_request');if(reserveError)return Response.json({message:'Unable to reserve AI request.'},{status:503});if(!reserved)return Response.json({message:input.lang==='fr'?'Limite de 10 demandes par heure atteinte. Réessayez plus tard.':'Limit of 10 requests per hour reached. Try again later.'},{status:429,headers:{'Retry-After':'3600'}});
 const scenarios=compareScenarios(input);
 const call=createResponsesCall(request,{baseURL:'https://ai.gateway.lovable.dev/v1',apiKey:aiKey,model:'openai/gpt-6-astra'},[{role:'user',content:JSON.stringify({currency:'XAF',...input,scenarios})}],`You explain illustrative loan affordability for NATINCCUL. Reply in ${input.lang==='fr'?'French':'English'}. Use only the supplied deterministic scenario figures, never recalculate, invent official lending rates, approve loans, or guarantee eligibility. Annual rate is user-assumed; fees are excluded. Monthly budget is available for repayments, not income. Compare shorter, selected, longer terms with budget surplus/shortfall and total cost, explain tradeoffs, reserve for unexpected expenses, and limitations without income/debt information. Do not suggest that budget fit establishes affordability or approval. Keep to three short paragraphs and a concluding reminder to confirm rates, fees and eligibility with NATINCCUL. No personal documents are needed.`);
 const iterator=call.result.fullStream[Symbol.asyncIterator]();
 const encode=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value)+'\n');
 async function failure(error:unknown){
   let status=500;let message='AI guidance could not be completed.';
   if(APICallError.isInstance(error)){status=error.statusCode??500;try{const body=JSON.parse(error.responseBody??'{}');message=body.message??body.error?.message??message;}catch{/* no safe message */}}
   if(status===402||status===403){await supabaseAdmin.from('ai_access_state').upsert({id:'affordability',blocked:true,status,message,updated_at:new Date().toISOString()});}
   return {type:'error',status,message};
 }
 const buffered:unknown[]=[];let finished=false;
 try{while(true){const next=await iterator.next();if(next.done){finished=true;break;}const p=next.value;if(p.type==='error'){const f=await failure(p.error);return Response.json({message:f.message},{status:f.status});}if(p.type==='text-delta'){buffered.push({type:'text',text:p.text});break;}if(p.type==='reasoning-delta'){buffered.push({type:'reasoning',text:p.text});break;}}}catch(error){if(request.signal.aborted)return new Response(null,{status:499});const f=await failure(error);return Response.json({message:f.message},{status:f.status});}
 const body=new ReadableStream<Uint8Array>({async start(controller){let hasText=false;try{for(const part of buffered){controller.enqueue(encode(part));if((part as {type:string}).type==='text')hasText=true;}if(!finished){while(true){const next=await iterator.next();if(next.done)break;const p=next.value;if(p.type==='text-delta'){hasText=true;controller.enqueue(encode({type:'text',text:p.text}));}else if(p.type==='reasoning-delta'){controller.enqueue(encode({type:'reasoning',text:p.text}));}else if(p.type==='error'){controller.enqueue(encode(await failure(p.error)));break;}}}if(!hasText&&!request.signal.aborted)controller.enqueue(encode({type:'error',message:'The model returned no guidance. This request has ended.'}));controller.enqueue(encode({type:'done'}));controller.close();}catch(error){if(!request.signal.aborted)controller.enqueue(encode(await failure(error)));controller.close();}},async cancel(){await iterator.return?.();}});
 const headers=new Headers({'Content-Type':'application/x-ndjson','Cache-Control':'no-store'});const runId=call.getRunId();if(runId)headers.set('X-Lovable-AIG-Run-ID',runId);
 return new Response(body,{headers});
}