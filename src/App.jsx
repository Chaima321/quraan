import {useEffect,useMemo,useState} from 'react';
import {sb,loadChecks,setCheck} from './db.js';
import {DAYS,WEEKS,PHASES,TOTAL_PAGES,START,lastDate,surahOf,juzOf,unitLabel,dayName,fmt,todayIdx,oldReview,levelPages} from './plan.js';

const ratio=(d,c)=>d.tasks.filter(t=>c.has(d.idx+':'+t[0])).length/d.tasks.length;

function Login(){
  const [e,setE]=useState(''),[p,setP]=useState(''),[m,setM]=useState('');
  const go=async up=>{const r=up?await sb.auth.signUp({email:e,password:p}):await sb.auth.signInWithPassword({email:e,password:p});setM(r.error?.message||(up?'تحقق من بريدك لتأكيد الحساب':''))};
  return <div className="login"><h1>متابعة الحفظ</h1><p>سجّل الدخول لتتزامن بياناتك بين الحاسوب والهاتف.</p>
    <input type="email" placeholder="البريد الإلكتروني" value={e} onChange={x=>setE(x.target.value)}/>
    <input type="password" placeholder="كلمة المرور" value={p} onChange={x=>setP(x.target.value)}/>
    <button onClick={()=>go(false)}>دخول</button><button className="ghost" onClick={()=>go(true)}>إنشاء حساب</button><small>{m}</small></div>;
}

function Card({d,c,tog}){
  const r=ratio(d,c),p=d.type==='mem'?surahOf(d.unit.p):surahOf(Math.max(1,Math.ceil(d.prior)));
  const title={mem:unitLabel(d.unit??{}),fri:'الجمعة — سرد الأسبوع',sat:'السبت — تثبيت',exam:'أسبوع المراجعة والاختبار'}[d.type];
  return <section className={'card '+d.type}>
    <header><div><b>{dayName(d.d)} {fmt(d.date)}</b><span>المرحلة {d.ph} · الأسبوع {d.w+1}</span></div><div className="ring" style={{'--r':r*360+'deg'}}>{Math.round(r*100)}%</div></header>
    <h3>{title}</h3>{d.type==='mem'&&<p className="meta">سورة {p} · الجزء {juzOf(d.unit.p)}</p>}
    {d.type==='exam'&&<p className="meta">اختبار تراكمي من أول الفاتحة إلى ص <bdi>{Math.ceil(d.prior)||'…'}</bdi>، لا حفظ جديد هذا الأسبوع.</p>}
    {(d.type==='fri'||d.type==='sat')&&<p className="meta">يشمل: من ص <bdi>{WEEKS[d.w].from?.p}</bdi> إلى ص <bdi>{Math.ceil(WEEKS[d.w].to?.end)}</bdi></p>}
    <ul>{d.tasks.map(([k,l,n])=>{const on=c.has(d.idx+':'+k);return <li key={k}><label className={on?'on':''}><input type="checkbox" checked={on} onChange={()=>tog(d.idx,k)}/><span>{k==='old'?<>{l}: <bdi>{oldReview(d)||'لا يوجد بعد'}</bdi></>:l}</span><em>{n}</em></label></li>})}</ul></section>;
}

function Stats({c,ti}){
  const done=DAYS.filter(d=>d.type==='mem'&&c.has(d.idx+':repeat')),pages=done.length?done[done.length-1].unit.end:0;
  const exact=done.reduce((s,d)=>s+(d.unit.h===0?1:.5),0);
  const planned=DAYS.filter(d=>d.type==='mem'&&d.idx<=ti).reduce((s,d)=>s+(d.unit.h===0?1:.5),0);
  const td=DAYS.find(d=>d.idx===Math.max(0,ti))||DAYS[0],ph=Math.min(td.ph,PHASES);
  const diff=exact-planned;let streak=0;for(let i=ti;i>=0;i--){const d=DAYS[i];if(d&&ratio(d,c)>=.99)streak++;else if(i!==ti)break}
  const nextExam=DAYS.find(d=>d.type==='exam'&&d.idx>=ti);
  const cur=ti<0?'لم نبدأ بعد':surahOf(Math.max(1,Math.ceil(td.type==='mem'?td.unit.p:td.prior)));
  return <div className="stats">
    <div className="hero"><b>{exact.toFixed(1)}</b><span>وجه محفوظ من {TOTAL_PAGES}</span>
      <div className="bar"><i style={{width:exact/TOTAL_PAGES*100+'%'}}/></div><small>{(exact/20).toFixed(2)} جزء من 30 · {(exact/TOTAL_PAGES*100).toFixed(1)}%</small></div>
    <div className="grid">
      <div><b>{cur}</b><span>السورة الحالية</span></div>
      <div><b>{ti<0?'—':`${ph} / ${PHASES}`}</b><span>المرحلة</span></div>
      <div><b>{ti<0?'—':td.w+1}</b><span>الأسبوع من {WEEKS.length}</span></div>
      <div><b className={diff<0?'bad':'good'}>{ti<0?'—':(diff>=0?'+':'')+diff.toFixed(1)}</b><span>وجه عن الخطة</span></div>
      <div><b>{streak}</b><span>أيام متتالية مكتملة</span></div>
      <div><b>{nextExam?fmt(nextExam.date):'—'}</b><span>أقرب أسبوع اختبار</span></div></div>
    {Array.from({length:Math.ceil(PHASES/10)},(_,L)=>{const [a,b]=levelPages(L+1);return <div key={L} className="lvl"><h4>المستوى {L+1} <small>من ص {a} إلى ص {b}</small></h4>
      <div className="phases">{Array.from({length:Math.min(10,PHASES-L*10)},(_,j)=>{const i=L*10+j;const ds=DAYS.filter(d=>d.ph===i+1&&d.type==='mem');const r=ds.length?ds.filter(d=>c.has(d.idx+':repeat')).length/ds.length:0;return <i key={i} title={'المرحلة '+(i+1)} className={i+1===ph?'now':''} style={{'--a':r}}>{i+1}</i>})}</div></div>})}
    <small className="end">آخر يوم في الخطة: {lastDate.toLocaleDateString('ar-DZ-u-nu-latn')}</small></div>;
}

function Calendar({c,sel,setSel,ti}){
  const base=new Date(START),[mo,setMo]=useState(()=>{const n=new Date();return n<START?new Date(START.getFullYear(),START.getMonth(),1):new Date(n.getFullYear(),n.getMonth(),1)});
  const first=new Date(mo.getFullYear(),mo.getMonth(),1),pad=first.getDay(),len=new Date(mo.getFullYear(),mo.getMonth()+1,0).getDate();
  const cells=[...Array(pad).fill(null),...Array.from({length:len},(_,i)=>{const dt=new Date(mo.getFullYear(),mo.getMonth(),i+1);return {dt,d:DAYS[Math.round((dt-START)/864e5)]}})];
  const ttl=mo.toLocaleDateString('ar-DZ-u-nu-latn',{month:'long',year:'numeric'});
  return <div className="cal"><div className="nav"><button onClick={()=>setMo(new Date(mo.getFullYear(),mo.getMonth()+1,1))}>›</button><b>{ttl}</b><button onClick={()=>setMo(new Date(mo.getFullYear(),mo.getMonth()-1,1))}>‹</button></div>
    <div className="dow">{['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'].map(x=><span key={x}>{x}</span>)}</div>
    <div className="days">{cells.map((x,i)=>!x?<span key={i}/>:<button key={i} disabled={!x.d} onClick={()=>setSel(x.d.idx)}
      className={[x.d?.type,x.d&&x.d.idx===ti?'today':'',x.d&&x.d.idx===sel?'sel':''].join(' ')} style={{'--a':x.d?ratio(x.d,c):0}}>
      {x.d&&x.d.d===0&&<sup>{x.d.w+1}</sup>}{x.dt.getDate()}</button>)}</div>
    <p className="legend"><i className="mem"/>حفظ <i className="fri"/>جمعة <i className="sat"/>سبت <i className="exam"/>اختبار · الرقم الصغير = رقم الأسبوع</p></div>;
}

export default function App(){
  const [user,setUser]=useState(sb?undefined:null),[c,setC]=useState(new Set()),[tab,setTab]=useState('today');
  const ti=todayIdx(),[sel,setSel]=useState(Math.min(Math.max(ti,0),DAYS.length-1));
  useEffect(()=>{if(!sb)return;sb.auth.getSession().then(r=>setUser(r.data.session?.user||null));const s=sb.auth.onAuthStateChange((_,x)=>setUser(x?.user||null));return()=>s.data.subscription.unsubscribe()},[]);
  useEffect(()=>{if(user!==undefined&&(user||!sb))loadChecks().then(setC)},[user]);
  const tog=(day,t)=>{const k=day+':'+t,n=new Set(c),on=!n.has(k);on?n.add(k):n.delete(k);setC(n);setCheck(day,t,on,n)};
  if(user===undefined)return null;
  if(sb&&!user)return <Login/>;
  const d=DAYS[sel];
  return <div className="app"><main>
    {ti<0&&<div className="note">تبدأ الخطة يوم {fmt(START)} — {-ti} يومًا متبقية.</div>}
    {tab==='today'&&<><div className="jump"><button onClick={()=>setSel(Math.max(0,sel-1))}>›</button><button onClick={()=>setSel(Math.min(Math.max(ti,0),DAYS.length-1))}>اليوم</button><button onClick={()=>setSel(Math.min(DAYS.length-1,sel+1))}>‹</button></div><Card d={d} c={c} tog={tog}/></>}
    {tab==='cal'&&<><Calendar c={c} sel={sel} setSel={setSel} ti={ti}/><Card d={d} c={c} tog={tog}/></>}
    {tab==='stats'&&<Stats c={c} ti={ti}/>}
  </main><nav>{[['today','اليوم'],['cal','التقويم'],['stats','الإحصائيات']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}</button>)}
    {sb&&<button onClick={()=>sb.auth.signOut()}>خروج</button>}</nav></div>;
}
