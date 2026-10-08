import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const sb=url&&key?createClient(url,key):null;
const LS='hifz-checks';
export async function loadChecks(){
  if(!sb)return new Set(JSON.parse(localStorage.getItem(LS)||'[]'));
  const {data}=await sb.from('checks').select('day,task').range(0,50000);
  return new Set((data||[]).map(r=>r.day+':'+r.task));}
export async function setCheck(day,task,on,all){
  if(!sb){localStorage.setItem(LS,JSON.stringify([...all]));return;}
  if(on)await sb.from('checks').upsert({day,task});
  else await sb.from('checks').delete().eq('day',day).eq('task',task);}
