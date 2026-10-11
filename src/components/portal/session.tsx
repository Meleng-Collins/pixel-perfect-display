import { createContext,useContext,useEffect,useState,type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { portalQuery } from '@/lib/portal.functions';

const SessionContext=createContext<{user:User|null;ready:boolean;lang:'en'|'fr';roles:string[]}>({user:null,ready:false,lang:'en',roles:[]});
export const useSession=()=>useContext(SessionContext);
export function SessionProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(null);const [ready,setReady]=useState(false);const router=useRouter();const client=useQueryClient();
  useEffect(()=>{let alive=true;supabase.auth.getUser().then(({data})=>{if(alive){setUser(data.user);setReady(true);}});const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return;setUser(session?.user??null);setReady(true);void router.invalidate();if(event!=='SIGNED_OUT')void client.invalidateQueries();});return()=>{alive=false;subscription.unsubscribe();};},[router,client]);
  const {data}=useQuery({...portalQuery,enabled:!!user});const lang=data?.profile?.preferred_language==='fr'?'fr':'en';
  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  return <SessionContext.Provider value={{user,ready,lang,roles:data?.roles??[]}}>{children}</SessionContext.Provider>;
}