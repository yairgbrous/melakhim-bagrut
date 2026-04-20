/* JARVIS-built melakhim-bagrut app.js — Babel standalone JSX */
const {useState,useEffect,useMemo,useRef,useCallback} = React;

const EXAM_DATE = '2026-04-30T08:00:00+03:00';
const EXAM_CODE = '2551';
const CLASSES = ['יא1','יא2','יא3','יא6'];
const AVATARS = ['👑','📜','⚔️','🕊️','🦁','🛕','🔥','🌿','📖','🏛️','✡️','🌅','⭐','🌳','🦅'];

const ilDate = (d=new Date())=> d.toLocaleDateString('en-CA',{timeZone:'Asia/Jerusalem'});
const num = n => <span className="num" dir="ltr">{n}</span>;
const heDays = d => d===0?'היום':d===1?'יום':d===2?'יומיים':`${d} ימים`;

function shuf(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function useLocal(key, init){
  const [v,setV] = useState(()=>{
    try{ const r=localStorage.getItem(key); return r?JSON.parse(r):init; }catch{return init;}
  });
  useEffect(()=>{ try{localStorage.setItem(key,JSON.stringify(v));}catch{} },[key,v]);
  return [v,setV];
}

function useCountdown(target){
  const [t,setT] = useState(()=>Date.parse(target)-Date.now());
  useEffect(()=>{
    const id=setInterval(()=>setT(Date.parse(target)-Date.now()),1000);
    return ()=>clearInterval(id);
  },[target]);
  if(t<=0) return {done:true,d:0,h:0,m:0,s:0};
  const s=Math.floor(t/1000);
  return {done:false, d:Math.floor(s/86400), h:Math.floor((s%86400)/3600), m:Math.floor((s%3600)/60), s:s%60};
}

function useDark(){
  const [dark,setDark]=useLocal('mb_dark', window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(()=>{ document.documentElement.classList.toggle('dark', dark); },[dark]);
  return [dark,setDark];
}

class EB extends React.Component{
  constructor(p){ super(p); this.state={err:null}; }
  static getDerivedStateFromError(err){ return {err}; }
  componentDidCatch(err,info){ console.error('EB:',err,info); }
  render(){
    if(this.state.err) return (
      <div className="p-6 max-w-xl mx-auto card my-10 text-center">
        <div className="text-3xl mb-2">😕</div>
        <h2 className="text-xl font-frank font-bold mb-2">משהו השתבש</h2>
        <p className="text-sm opacity-70 mb-4">נסה לרענן את הדף.</p>
        <button className="btn btn-primary" onClick={()=>location.reload()} aria-label="רענן">רענון</button>
      </div>
    );
    return this.props.children;
  }
}

function EmptyState({icon='📭', title='אין נתונים עדיין', sub=''}){
  return (
    <div className="text-center py-10 opacity-80">
      <div className="text-5xl mb-2">{icon}</div>
      <div className="font-frank font-bold text-lg">{title}</div>
      {sub && <div className="text-sm opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

function Toast({msg,onClose}){
  useEffect(()=>{ const id=setTimeout(onClose,3500); return ()=>clearTimeout(id); },[onClose]);
  return <div className="toast" role="status">{msg}</div>;
}

const UNITS = [
  {id:'u1',num:1,title:'מלכות שלמה',sub:'בניין המקדש וחכמת שלמה',ch:'מל״א א-יא',emoji:'👑'},
  {id:'u2',num:2,title:'פילוג הממלכה',sub:'רחבעם, ירבעם וחטאת העגלים',ch:'מל״א יב-טז',emoji:'⚔️'},
  {id:'u3',num:3,title:'אליהו ואחאב',sub:'הר הכרמל וכרם נבות',ch:'מל״א יז-כב',emoji:'🔥'},
  {id:'u4',num:4,title:'אלישע ומהפכת יהוא',sub:'נסי אלישע ונפילת בית עמרי',ch:'מל״ב א-יג',emoji:'🌿'},
  {id:'u5',num:5,title:'עליית אשור וגלות ישראל',sub:'מסע סנחריב וחזקיהו',ch:'מל״ב יד-כ',emoji:'🛡️'},
  {id:'u6',num:6,title:'חורבן בית ראשון',sub:'יאשיהו, צדקיהו והגלות',ch:'מל״ב כא-כה',emoji:'🕯️'},
];

const TOPICS = [
  {id:'t1',title:'נביא ומלך',emoji:'📜'},
  {id:'t2',title:'עבודה זרה',emoji:'🛐'},
  {id:'t3',title:'בית המקדש',emoji:'🛕'},
  {id:'t4',title:'נבואה וגאולה',emoji:'🕊️'},
  {id:'t5',title:'ברית וגורל העם',emoji:'✡️'},
  {id:'t6',title:'מנהיגות ומוסר',emoji:'⚖️'},
  {id:'t7',title:'נס וטבע',emoji:'⚡'},
];

const KINGS = [
  ['שלמה','יהודה','מלך מאוחדת — חכם, בנה את המקדש'],
  ['רחבעם','יהודה','בנו של שלמה, פילוג הממלכה'],
  ['ירבעם בן נבט','ישראל','עגלי הזהב בדן ובית-אל'],
  ['אסא','יהודה','ביער עבודה זרה'],
  ['יהושפט','יהודה','ברית עם אחאב'],
  ['אחאב','ישראל','בעל; כרם נבות; הר הכרמל'],
  ['איזבל','ישראל','אשת אחאב — הסיתה לעבודה זרה'],
  ['אחזיהו (ישראל)','ישראל','שלח לבעל זבוב'],
  ['יהורם','ישראל','בנו של אחאב'],
  ['יהוא','ישראל','מהפכה נגד בית עמרי'],
  ['חזקיהו','יהודה','רפורמה דתית; מסע סנחריב'],
  ['מנשה','יהודה','שיא העבודה הזרה'],
  ['אמון','יהודה','כמנשה אביו'],
  ['יאשיהו','יהודה','מציאת ספר התורה; ברית'],
  ['יהואחז','יהודה','גלה למצרים'],
  ['יהויקים','יהודה','מרד בבבל'],
  ['יהויכין','יהודה','גלות יהויכין'],
  ['צדקיהו','יהודה','חורבן בית ראשון'],
  ['ירבעם השני','ישראל','שלטון ארוך והרחבת גבולות'],
  ['הושע בן אלה','ישראל','המלך האחרון; גלות שומרון'],
];

const QUESTIONS = [
  {u:'u1',t:'short',q:'מה חלם שלמה בגבעון?',a:['כסף ועושר','אריכות ימים','לב שומע — חכמה','ניצחון על אויביו'],c:2,exp:'שלמה ביקש "לב שומע לשפוט את עמך" (מל״א ג, ט).',src:'מל״א ג'},
  {u:'u1',t:'short',q:'כמה שנים נבנה בית המקדש?',a:['7','13','20','40'],c:0,exp:'בית המקדש נבנה בשבע שנים (מל״א ו, לח).',src:'מל״א ו'},
  {u:'u1',t:'who',q:'מי בא לבחון את שלמה בחידות?',a:['פרעה מלך מצרים','חירם מלך צור','מלכת שבא','בן הדד'],c:2,exp:'מלכת שבא באה לנסות את שלמה בחידות (מל״א י).',src:'מל״א י'},
  {u:'u2',t:'short',q:'מה היה הגורם לפילוג הממלכה?',a:['רעב כבד','מס כבד שכפה רחבעם','מגיפה','פלישה ממצרים'],c:1,exp:'רחבעם דחה את עצת הזקנים והכביד עול — ישראל פרשו (מל״א יב).',src:'מל״א יב'},
  {u:'u2',t:'place',q:'היכן הציב ירבעם את עגלי הזהב?',a:['שכם וירושלים','דן ובית אל','חברון ושומרון','מגידו ובאר שבע'],c:1,exp:'"וישם את האחד בבית-אל ואת האחד נתן בדן" (מל״א יב, כט).',src:'מל״א יב'},
  {u:'u3',t:'short',q:'מי ניצח בתחרות בהר הכרמל?',a:['נביאי הבעל','אליהו','איזבל','עובדיה'],c:1,exp:'אש ה׳ ירדה על מזבח אליהו והוכיחה כי ה׳ הוא האלוהים (מל״א יח).',src:'מל״א יח'},
  {u:'u3',t:'who',q:'של מי היה הכרם שאחאב חמד?',a:['עובדיה','נבות היזרעאלי','אליהו','בן הדד'],c:1,exp:'נבות סירב למכור את נחלת אבותיו — איזבל הרגתו (מל״א כא).',src:'מל״א כא'},
  {u:'u3',t:'short',q:'איזה קול שמע אליהו בחורב?',a:['רעם','רעש','קול דממה דקה','שופר'],c:2,exp:'"ואחר האש קול דממה דקה" (מל״א יט, יב).',src:'מל״א יט'},
  {u:'u4',t:'short',q:'מה עשה אלישע למים המרים ביריחו?',a:['הסיר אבן','השליך מלח','הצית אש','התפלל בלבד'],c:1,exp:'אלישע השליך מלח בקערה חדשה וריפא את המים (מל״ב ב).',src:'מל״ב ב'},
  {u:'u4',t:'who',q:'מי טבל שבע פעמים בירדן ונרפא?',a:['גיחזי','נעמן שר צבא ארם','חזאל','בן הדד'],c:1,exp:'נעמן צרע נרפא לאחר שטבל שבע פעמים בירדן (מל״ב ה).',src:'מל״ב ה'},
  {u:'u4',t:'about',q:'מי משח את יהוא למלך?',a:['אליהו','אלישע באמצעות נער','חזאל','יהויאדע הכהן'],c:1,exp:'אלישע שלח את אחד מבני הנביאים למשוח את יהוא (מל״ב ט).',src:'מל״ב ט'},
  {u:'u5',t:'short',q:'מי המלך שתחת מסעו נפלה שומרון?',a:['תגלת פלאסר','שלמנאסר/סרגון','סנחריב','נבוכדנאצר'],c:1,exp:'שומרון נפלה בידי שלמנאסר ו/או סרגון (מל״ב יז).',src:'מל״ב יז'},
  {u:'u5',t:'who',q:'מי הציל את ירושלים בנס מסנחריב?',a:['חזקיהו לבדו','מלאך ה׳','מצרים','בבל'],c:1,exp:'מלאך ה׳ היכה במחנה אשור (מל״ב יט, לה).',src:'מל״ב יט'},
  {u:'u5',t:'about',q:'מה אמר חזקיהו על דברי הנביא ישעיהו לבלוע ימי גלות?',a:['התנגד','שתק','"טוב דבר ה׳"','שלח שליחים'],c:2,exp:'חזקיהו אמר "טוב דבר ה׳ אשר דברת" (מל״ב כ, יט).',src:'מל״ב כ'},
  {u:'u6',t:'short',q:'מה נמצא בבית המקדש בימי יאשיהו?',a:['ארון הברית','ספר התורה','כתבי ירמיהו','כלי כסף'],c:1,exp:'חלקיהו הכהן מצא את ספר התורה — יאשיהו כרת ברית (מל״ב כב).',src:'מל״ב כב'},
  {u:'u6',t:'who',q:'מי המלך האחרון של יהודה?',a:['יהויקים','יהויכין','צדקיהו','יאשיהו'],c:2,exp:'צדקיהו מרד בנבוכדנאצר ובימיו חרבה ירושלים (מל״ב כד-כה).',src:'מל״ב כה'},
  {u:'u6',t:'place',q:'להיכן הוגלה צדקיהו לאחר שעיניו עוורו?',a:['מצרים','בבל','אשור','פרס'],c:1,exp:'נבוכדנאצר הוליכו בבלה (מל״ב כה, ז).',src:'מל״ב כה'},
  {u:'u6',t:'short',q:'באיזה חודש החל המצור על ירושלים בימי צדקיהו?',a:['ניסן','תמוז','עשירי (טבת)','אב'],c:2,exp:'"בחדש העשירי בעשור לחדש" (מל״ב כה, א).',src:'מל״ב כה'},
];

function Countdown(){
  const c = useCountdown(EXAM_DATE);
  if(c.done) return <div className="card text-center"><div className="font-frank text-2xl font-bold">המבחן החל — בהצלחה!</div></div>;
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-widest opacity-60 mb-1">ספירה לאחור לבגרות</div>
      <div className="flex items-end gap-3 flex-wrap">
        <div><div className="count-big">{num(c.d)}</div><div className="text-xs opacity-70">{heDays(c.d)}</div></div>
        <div className="text-3xl opacity-40">·</div>
        <div><div className="count-big">{num(String(c.h).padStart(2,'0'))}</div><div className="text-xs opacity-70">שעות</div></div>
        <div><div className="count-big">{num(String(c.m).padStart(2,'0'))}</div><div className="text-xs opacity-70">דקות</div></div>
        <div><div className="count-big">{num(String(c.s).padStart(2,'0'))}</div><div className="text-xs opacity-70">שניות</div></div>
      </div>
      <div className="strip mt-3"></div>
      <div className="text-xs opacity-60 mt-2">בחינת בגרות בתנ״ך · שאלון <span dir="ltr">{EXAM_CODE}</span> · 30.04.2026</div>
    </div>
  );
}

function Onboarding({onDone}){
  const [name,setName] = useState('');
  const [klass,setKlass] = useState('');
  const [avatar,setAvatar] = useState('👑');
  const valid = name.trim().length>=2 && klass;
  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="card w-full max-w-md">
        <div className="text-center mb-3">
          <div className="text-5xl">📖</div>
          <h1 className="font-frank text-3xl font-extrabold mt-2">מלכים — בגרות {num(2551)}</h1>
          <p className="text-sm opacity-70 mt-1">ברוכים הבאים. בואו נכיר.</p>
        </div>
        <label className="block text-sm font-bold mb-1">השם שלך</label>
        <input aria-label="שם" value={name} onChange={e=>setName(e.target.value)} placeholder="לדוגמה: דניאל" className="w-full px-3 py-2 rounded-lg border border-gold mb-4 bg-transparent" />
        <label className="block text-sm font-bold mb-1">כיתה</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {CLASSES.map(k=>(
            <button key={k} onClick={()=>setKlass(k)} aria-pressed={klass===k} aria-label={`כיתה ${k}`}
              className={`btn ${klass===k?'btn-gold':'btn-ghost'} text-sm`}>{k}</button>
          ))}
        </div>
        <label className="block text-sm font-bold mb-1">בחר אווטאר</label>
        <div className="grid grid-cols-8 gap-1 mb-5">
          {AVATARS.map(a=>(
            <button key={a} onClick={()=>setAvatar(a)} aria-label={`אווטאר ${a}`}
              className={`text-2xl p-2 rounded-lg ${avatar===a?'bg-yellow-200 dark:bg-yellow-900':''}`}>{a}</button>
          ))}
        </div>
        <button disabled={!valid} onClick={()=>onDone({id:'u_'+Math.random().toString(36).slice(2,9),name:name.trim(),klass,avatar,createdAt:Date.now(),score:0,streak:0,lastDay:'',answered:0,correct:0})}
          className={`btn w-full ${valid?'btn-primary':'btn-ghost opacity-50'}`} aria-label="התחל">המשך</button>
      </div>
    </div>
  );
}

function Header({user,dark,setDark,onProfile,view,setView}){
  const tabs = [['home','בית'],['quiz','תרגול'],['sim','סימולציה'],['kings','מלכים'],['leader','דירוג']];
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-parchment/85 dark:bg-[#0a0a0f]/85 border-b border-gold/40">
      <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-2">
        <button onClick={()=>setView('home')} className="font-frank font-extrabold text-xl">📖 מלכים <span className="text-xs opacity-60">{num(2551)}</span></button>
        <nav className="flex flex-1 gap-1 justify-center flex-wrap">
          {tabs.map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} className={`nav-btn ${view===k?'active':''}`} aria-current={view===k?'page':undefined}>{l}</button>
          ))}
        </nav>
        <button aria-label="מצב כהה" onClick={()=>setDark(!dark)} className="btn btn-ghost text-sm">{dark?'☀️':'🌙'}</button>
        <button aria-label="פרופיל" onClick={onProfile} className="btn btn-ghost text-sm">{user.avatar} {user.name}</button>
      </div>
    </header>
  );
}

const HEB_LETTER = ['א׳','ב׳','ג׳','ד׳'];

function Quiz({pool,user,onFinish,title='תרגול'}){
  const [items] = useState(()=>{
    return shuf(pool).map(q=>{
      const ix = shuf([0,1,2,3]);
      return {...q, a: ix.map(i=>q.a[i]), c: ix.indexOf(q.c)};
    });
  });
  const [i,setI] = useState(0);
  const [picked,setPicked] = useState(null);
  const [showExp,setShowExp] = useState(false);
  const [missed,setMissed] = useState([]);
  const [right,setRight] = useState(0);
  const total = items.length;
  const q = items[i];

  const choose = (k)=>{
    if(picked!==null) return;
    setPicked(k);
    if(k===q.c){ setRight(r=>r+1); }
    else { setMissed(m=>[...m,{...q,picked:k}]); setShowExp(true); }
  };
  const next = ()=>{
    if(i+1>=total){ onFinish({right, total, missed}); return; }
    setI(i+1); setPicked(null); setShowExp(false);
  };
  if(!q) return <EmptyState title="אין שאלות" />;
  return (
    <div className="max-w-2xl mx-auto p-3 pb-24">
      <div className="flex items-center justify-between mb-2">
        <span className="chip">{title}</span>
        <span className="text-sm opacity-70">שאלה {num(i+1)} / {num(total)}</span>
      </div>
      <div className="rankbar mb-4"><div style={{width:`${(i/total)*100}%`}}></div></div>
      <div className="card">
        <div className="text-xs opacity-60 mb-2">{q.src}</div>
        <h2 className="font-frank text-xl font-bold mb-4">{q.q}</h2>
        <div className="grid gap-2">
          {q.a.map((opt,k)=>{
            const isPicked = picked===k;
            const isCorrect = picked!==null && k===q.c;
            const isWrong = isPicked && k!==q.c;
            const cls = isCorrect?'ans correct':isWrong?'ans wrong':'ans';
            return (
              <button key={k} onClick={()=>choose(k)} aria-label={`תשובה ${HEB_LETTER[k]}`}
                className={cls} style={{transform: isPicked?'scale(0.98)':'none'}}>
                <span className="ans-letter">{HEB_LETTER[k]}</span>
                <span className="text-right flex-1">{opt}</span>
              </button>
            );
          })}
        </div>
        {picked!==null && (
          <div className="mt-4">
            <button className="text-sm underline opacity-80" onClick={()=>setShowExp(s=>!s)} aria-expanded={showExp}>
              {showExp?'הסתר הסבר':'הצג הסבר'}
            </button>
            {showExp && <div className="quote-card mt-2"><div className="mini-corners"></div><div className="font-david text-base leading-relaxed">{q.exp}</div></div>}
          </div>
        )}
      </div>
      <div className="sticky bottom-2 mt-4">
        <button disabled={picked===null} onClick={next}
          className={`btn w-full ${picked===null?'btn-ghost opacity-50':'btn-primary'}`} aria-label="שאלה הבאה">
          {i+1>=total?'סיום וצפייה בתוצאות':'הבאה ←'}
        </button>
      </div>
    </div>
  );
}

function Results({result,user,onReview,onHome,onRetry}){
  const pct = Math.round((result.right/result.total)*100);
  const grade = pct>=90?'מצוין':pct>=75?'טוב מאוד':pct>=60?'טוב':'יש מה לשפר';
  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="card text-center">
        <div className="text-5xl mb-1">{pct>=75?'🏆':pct>=60?'👏':'📚'}</div>
        <div className="font-frank text-2xl font-bold">{grade}</div>
        <div className="count-big mt-2">{num(result.right)} / {num(result.total)}</div>
        <div className="opacity-70 mt-1">דיוק <span dir="ltr">{pct}%</span></div>
        <div className="strip my-4"></div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-ghost" onClick={onRetry} aria-label="נסה שוב">סיבוב נוסף</button>
          <button className="btn btn-gold" disabled={!result.missed.length} onClick={onReview} aria-label="סקירת טעויות">
            סקור {num(result.missed.length)} טעויות
          </button>
        </div>
        <button className="btn btn-primary w-full mt-2" onClick={onHome} aria-label="לעמוד הבית">חזרה לבית</button>
      </div>
    </div>
  );
}

function ReviewMissed({missed,onBack}){
  if(!missed.length) return <EmptyState title="אין טעויות 🎉" />;
  return (
    <div className="max-w-2xl mx-auto p-3 space-y-3">
      <h2 className="font-frank text-2xl font-bold">סקירת טעויות ({num(missed.length)})</h2>
      {missed.map((q,idx)=>(
        <div key={idx} className="card">
          <div className="text-xs opacity-60 mb-1">{q.src}</div>
          <div className="font-bold mb-2">{q.q}</div>
          <div className="text-sm mb-1"><span className="ans-letter inline-flex" style={{width:24,height:24,fontSize:14}}>✗</span> בחרת: {q.a[q.picked]}</div>
          <div className="text-sm mb-3"><span className="ans-letter inline-flex" style={{width:24,height:24,fontSize:14}}>✓</span> נכון: {q.a[q.c]}</div>
          <div className="quote-card"><div className="mini-corners"></div><div className="font-david">{q.exp}</div></div>
        </div>
      ))}
      <button className="btn btn-primary w-full" onClick={onBack} aria-label="חזרה">חזרה</button>
    </div>
  );
}
