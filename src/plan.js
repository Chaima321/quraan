// خطة الحفظ: نفس وتيرة المعهد (نصف وجه يوميا، أحد-خميس، 4 أسابيع حفظ + أسبوع اختبار)
export const START=new Date((import.meta.env.VITE_START_DATE||'2026-10-04')+'T00:00:00');
const S=[[1,'الفاتحة'],[2,'البقرة'],[50,'آل عمران'],[77,'النساء'],[106,'المائدة'],[128,'الأنعام'],[151,'الأعراف'],[177,'الأنفال'],[187,'التوبة'],[208,'يونس'],[221,'هود'],[235,'يوسف'],[249,'الرعد'],[255,'إبراهيم'],[262,'الحجر'],[267,'النحل'],[282,'الإسراء'],[293,'الكهف'],[305,'مريم'],[312,'طه'],[322,'الأنبياء'],[332,'الحج'],[342,'المؤمنون'],[350,'النور'],[359,'الفرقان'],[367,'الشعراء'],[377,'النمل'],[385,'القصص'],[396,'العنكبوت'],[404,'الروم'],[411,'لقمان'],[415,'السجدة'],[418,'الأحزاب'],[428,'سبأ'],[434,'فاطر'],[440,'يس'],[446,'الصافات'],[453,'ص'],[458,'الزمر'],[467,'غافر'],[477,'فصلت'],[483,'الشورى'],[489,'الزخرف'],[496,'الدخان'],[499,'الجاثية'],[502,'الأحقاف'],[507,'محمد'],[511,'الفتح'],[515,'الحجرات'],[518,'ق'],[520,'الذاريات'],[523,'الطور'],[526,'النجم'],[528,'القمر'],[531,'الرحمن'],[534,'الواقعة'],[537,'الحديد'],[542,'المجادلة'],[545,'الحشر'],[549,'الممتحنة'],[551,'الصف'],[553,'الجمعة'],[554,'المنافقون'],[556,'التغابن'],[558,'الطلاق'],[560,'التحريم'],[562,'الملك'],[564,'القلم'],[566,'الحاقة'],[568,'المعارج'],[570,'نوح'],[572,'الجن'],[574,'المزمل'],[575,'المدثر'],[577,'القيامة'],[578,'الإنسان'],[580,'المرسلات'],[582,'النبأ'],[583,'النازعات'],[585,'عبس'],[586,'التكوير'],[587,'الانفطار'],[589,'الانشقاق'],[590,'البروج'],[591,'الطارق'],[592,'الغاشية'],[593,'الفجر'],[594,'البلد'],[595,'الشمس'],[596,'الضحى'],[597,'التين'],[598,'القدر'],[599,'الزلزلة'],[600,'القارعة'],[601,'العصر'],[602,'قريش'],[603,'الكافرون'],[604,'الإخلاص']];
export const surahOf=p=>{let n=S[0][1];for(const[s,nm]of S){if(s<=p)n=nm;else break}return n};
export const juzOf=p=>p<22?1:Math.min(30,Math.floor((p-2)/20)+1);
// وحدات: ص1، ص2، ثم نصف وجه لكل يوم
const units=[{p:1,h:0,end:1},{p:2,h:0,end:2}];
for(let p=3;p<=604;p++){units.push({p,h:1,end:p-.5});units.push({p,h:2,end:p})}
export const TOTAL_PAGES=604;
const AR=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
export const dayName=i=>AR[i];
export const unitLabel=u=>u.h===0?`الصفحة ${u.p}`:`ص ${u.p} — ${u.h===1?'النصف الأول':'النصف الثاني'}`;
export const MEM=[['tafsir','قراءة التفسير (فهم معاني المقدار)','×1'],['listen','سماع القارئ المجوّد','×5'],['tajweed','ضبط التلاوة','×5'],['repeat','التكرار والربط نظرًا','×50'],['record','التسميع غيبًا','×5'],['yest','مراجعة الأمس حدرًا','×5'],['old','مراجعة القديم','']];
export const FRI=[['sard','سرد نصاب الأسبوع (5–10 مرات)','']];
export const SAT=[['listenW','سماع نصاب الأسبوع','']  ,['tath','تثبيت المتفلت (إعادة الحفظ)','×50']];
export const EXAM=[['review','مراجعة المحفوظ كله — 3 أجزاء يوميًا','']];
const weeks=[],days=[];let ptr=0,w=0;
while(ptr<units.length){
  const ph=Math.floor(w/5)+1,wi=w%5;
  if(wi===4){weeks.push({w,ph,exam:true});w++;continue}
  const us=units.slice(ptr,ptr+5);weeks.push({w,ph,exam:false,from:us[0],to:us[us.length-1]});
  const doneBefore=ptr?units[ptr-1].end:0;
  for(let d=0;d<7;d++){
    const idx=w*7+d;const date=new Date(START);date.setDate(date.getDate()+idx);
    const base={idx,date,w,ph,d,prior:d<5?(ptr+d?units[Math.min(ptr+d,units.length)-1].end:0):us[us.length-1].end};
    if(d<5&&us[d])days.push({...base,type:'mem',unit:us[d],tasks:MEM});
    else days.push({...base,type:d===5?'fri':'sat',tasks:d===5?FRI:SAT,prior:us[us.length-1].end});
  }
  ptr+=5;w++;
}
if(!weeks[weeks.length-1].exam){const ph=Math.floor(w/5)+1;weeks.push({w,ph,exam:true})}
{const last=weeks[weeks.length-1];if(!days.some(x=>x.w===last.w))for(let d=0;d<7;d++){const idx=last.w*7+d;const date=new Date(START);date.setDate(date.getDate()+idx);days.push({idx,date,w:last.w,ph:last.ph,d,type:'exam',tasks:EXAM,prior:TOTAL_PAGES})}}
// أسابيع الاختبار (الخامس في كل مرحلة)
for(const x of weeks.filter(x=>x.exam))for(let d=0;d<7;d++){const k=days.find(z=>z.idx===x.w*7+d);if(k){k.type='exam';k.tasks=EXAM;k.prior=k.prior}}
for(const x of days)if(x.type==='exam'||weeks[x.w].exam){x.type='exam';x.tasks=EXAM}
// مراجعة الأيام التي لم تُولَّد (أسابيع الاختبار في المنتصف)
for(const x of weeks.filter(x=>x.exam))for(let d=0;d<7;d++)if(!days.some(z=>z.idx===x.w*7+d)){const idx=x.w*7+d;const date=new Date(START);date.setDate(date.getDate()+idx);const prev=days.filter(z=>z.w<x.w).pop();days.push({idx,date,w:x.w,ph:x.ph,d,type:'exam',tasks:EXAM,prior:prev?prev.prior:0})}
days.sort((a,b)=>a.idx-b.idx);
export const WEEKS=weeks,DAYS=days,PHASES=Math.max(...weeks.map(x=>x.ph));
export const lastDate=days[days.length-1].date;
export const fmt=d=>d.toLocaleDateString('ar-DZ-u-nu-latn',{day:'numeric',month:'long'});
export const todayIdx=()=>{const n=new Date();n.setHours(0,0,0,0);return Math.round((n-START)/864e5)};

// مراجعة القديم: كما في ملف المستوى 1 (من ص1 إلى أمس، ثم كتل جزأين ج١+ج٢، ج٣+ج٤…)، وما بعد ص101 بنفس القاعدة (توقّع)
const jEnd=k=>20*k+1,jStart=k=>k===1?1:20*(k-1)+2,AD=n=>String(n).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
export function oldReview(d){
  const prior=d.prior||0;if(Math.ceil(prior)<3)return null;
  let J=0;while(J<30&&jEnd(J+1)<=prior)J++;
  const items=[];for(let i=1;i<=Math.floor(J/2);i++)items.push(`ج${AD(2*i-1)} + ج${AD(2*i)}`);
  if(prior>jEnd(J)&&J<30){const s=jStart(J%2?J:J+1);items.push(`من ص ${AD(s)} إلى ص ${AD(Math.ceil(prior))}`)}
  else if(J%2)items.push(`ج${AD(J)}`);
  return items.length?items[d.idx%items.length]:null;
}
export const levelPages=n=>[n===1?1:(n-1)*100+2,Math.min(604,n*100+1)];