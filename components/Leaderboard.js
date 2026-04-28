/* =========================================================================
   Leaderboard — bagrut 2551 class leaderboard.
   Tabs: יא1 | יא2 | יא3 | יא6 | כל השכבה
   Source: Firebase RTDB /leaderboard/{class}/{uid}
   Read is public (rule .read: true). Auto-updates on `mb-local-write` and
   `storage` events so XP gains in another tab refresh the table.
   Mounts as window.LeaderboardComponent.
   ========================================================================= */
(function(){
  const { useState, useEffect, useMemo, useCallback } = React;

  const CLASSES = ['יא1','יא2','יא3','יא6'];
  const TABS = [...CLASSES, 'all'];

  function fmtRelTime(ts){
    if (!ts || typeof ts !== 'number') return '—';
    const d = Date.now() - ts;
    if (d < 60*1000) return 'עכשיו';
    if (d < 60*60*1000) return Math.floor(d/(60*1000)) + ' דק׳';
    if (d < 24*60*60*1000) return Math.floor(d/(60*60*1000)) + ' שע׳';
    const days = Math.floor(d/(24*60*60*1000));
    if (days === 1) return 'אתמול';
    if (days < 14) return days + ' ימים';
    return new Date(ts).toLocaleDateString('he-IL');
  }

  function authState(){
    const A = window.MelakhimAuth;
    return A && A.getState ? A.getState() : null;
  }

  async function fetchTab(tab){
    const A = window.MelakhimAuth;
    if (!A) return [];
    if (tab === 'all'){
      const all = await A.getAllLeaderboard();
      if (!all || typeof all !== 'object') return [];
      const rows = [];
      Object.entries(all).forEach(([cls, members]) => {
        if (!members || typeof members !== 'object') return;
        Object.entries(members).forEach(([uid, m]) => {
          if (!m) return;
          rows.push({
            uid,
            classCode: cls,
            display_name: m.display_name || 'תלמיד/ה',
            xp: +m.xp || 0,
            units_completed: +m.units_completed || 0,
            exam_avg: +m.exam_avg || 0,
            last_active: +m.last_active || 0
          });
        });
      });
      return rows;
    }
    const members = await A.getLeaderboard(tab);
    if (!members || typeof members !== 'object') return [];
    return Object.entries(members).map(([uid, m]) => ({
      uid,
      classCode: tab,
      display_name: (m && m.display_name) || 'תלמיד/ה',
      xp: (m && +m.xp) || 0,
      units_completed: (m && +m.units_completed) || 0,
      exam_avg: (m && +m.exam_avg) || 0,
      last_active: (m && +m.last_active) || 0
    }));
  }

  function tabLabel(t){
    return t === 'all' ? 'כל השכבה' : t;
  }

  function Leaderboard({ setRoute }){
    const [auth, setAuth]   = useState(() => authState() || {});
    const [tab,  setTab]    = useState(() => {
      const a = authState();
      return (a && a.userClass && CLASSES.indexOf(a.userClass) >= 0) ? a.userClass : 'all';
    });
    const [rows, setRows]   = useState(null);
    const [err,  setErr]    = useState(null);
    const [loading, setLoading] = useState(false);

    // Subscribe to auth state.
    useEffect(() => {
      const A = window.MelakhimAuth;
      if (!A || !A.subscribe) return;
      return A.subscribe(setAuth);
    }, []);

    // Load tab data.
    const reload = useCallback(async () => {
      setLoading(true);
      setErr(null);
      try {
        const list = await fetchTab(tab);
        list.sort((a,b) => (b.xp - a.xp) || (b.last_active - a.last_active));
        setRows(list);
      } catch (e) {
        setErr((e && e.message) || String(e));
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, [tab]);

    useEffect(() => { reload(); }, [reload]);

    // Auto-refresh on local progress writes (own XP changes) + when another
    // tab updates localStorage (storage event). Lightweight — re-fetches list.
    useEffect(() => {
      let pending = null;
      const debouncedReload = () => {
        if (pending) return;
        pending = setTimeout(() => { pending = null; reload(); }, 1500);
      };
      const onStorage = (e) => {
        if (!e || !e.key) return;
        if (/xp|attempt|exam|unit/i.test(e.key)) debouncedReload();
      };
      const onWrite = (e) => {
        const d = e && e.detail;
        if (!d || !d.key) return;
        if (/xp|attempt|exam|unit/i.test(d.key)) debouncedReload();
      };
      window.addEventListener('storage', onStorage);
      window.addEventListener('mb-local-write', onWrite);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('mb-local-write', onWrite);
        if (pending) clearTimeout(pending);
      };
    }, [reload]);

    const myUid = auth && auth.user && auth.user.uid;
    const isSignedIn = !!myUid;
    const noConfig = auth && (auth.status === 'no-config' || auth.status === 'disabled');

    return (
      <div className="mb-leaderboard-root" dir="rtl">
        <header className="mb-lb-head">
          <h1 className="font-display">🏆 טבלת מובילי הכיתה</h1>
          <p className="mb-lb-sub">ראה את המובילים בכיתתך ובכל השכבה — מתעדכן בזמן אמת.</p>
        </header>

        <div className="mb-lb-tabs" role="tablist" aria-label="בחירת כיתה">
          {TABS.map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={()=>setTab(t)}
              className={`mb-lb-tab ${tab === t ? 'active' : ''}`}>
              {tabLabel(t)}
            </button>
          ))}
        </div>

        {!isSignedIn && (
          <div className="mb-lb-cta parchment">
            <div className="mb-lb-cta-text">התחבר כדי להופיע בטבלה</div>
            <button
              type="button"
              className="gold-btn mb-lb-cta-btn"
              onClick={() => {
                if (window.MelakhimAuth && window.MelakhimAuth.signIn) window.MelakhimAuth.signIn();
              }}>
              🔑 התחברות עם Google
            </button>
          </div>
        )}

        {noConfig && (
          <div className="mb-lb-warn parchment">
            הטבלה דורשת חיבור ל-Firebase. נא לפנות למורה.
          </div>
        )}

        {loading && rows === null ? (
          <div className="mb-lb-skel parchment" aria-busy="true">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="mb-lb-skel-row">
                <div className="skel" style={{width:32, height:14, borderRadius:6}}/>
                <div className="skel" style={{flex:1, height:14, borderRadius:6}}/>
                <div className="skel" style={{width:48, height:14, borderRadius:6}}/>
              </div>
            ))}
          </div>
        ) : err ? (
          <div className="mb-lb-warn parchment">שגיאה בטעינת הטבלה: {err}</div>
        ) : (rows && rows.length === 0) ? (
          <div className="mb-lb-empty parchment">
            עדיין אין תלמידים בטבלה הזו. היה הראשון — צבור XP ופתור מתכונת!
          </div>
        ) : rows ? (
          <div className="mb-lb-table-wrap parchment">
            <div className="mb-lb-table" role="table" aria-label={'דירוג ' + tabLabel(tab)}>
              <div className="mb-lb-row mb-lb-row-head" role="row">
                <span role="columnheader" className="col-rank">דירוג</span>
                <span role="columnheader" className="col-name">שם</span>
                <span role="columnheader" className="col-xp">XP</span>
                <span role="columnheader" className="col-units">יחידות</span>
                <span role="columnheader" className="col-exam">בחינות</span>
                <span role="columnheader" className="col-active">פעיל</span>
              </div>
              {rows.map((r, i) => {
                const isMe = myUid && r.uid === myUid;
                return (
                  <div key={r.uid + ':' + r.classCode} role="row"
                    className={`mb-lb-row ${isMe ? 'me' : ''} ${i < 3 ? 'top' + (i+1) : ''}`}>
                    <span role="cell" className="col-rank">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)}
                    </span>
                    <span role="cell" className="col-name">
                      <span className="mb-lb-name">{r.display_name || 'תלמיד/ה'}</span>
                      {tab === 'all' && (
                        <span className="mb-lb-classchip">{r.classCode}</span>
                      )}
                      {isMe && <span className="mb-lb-me">אני</span>}
                    </span>
                    <span role="cell" className="col-xp" dir="ltr">{r.xp.toLocaleString('he-IL')}</span>
                    <span role="cell" className="col-units" dir="ltr">{r.units_completed}/6</span>
                    <span role="cell" className="col-exam" dir="ltr">
                      {r.exam_avg ? Math.round(r.exam_avg) : '—'}
                    </span>
                    <span role="cell" className="col-active">{fmtRelTime(r.last_active)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mb-lb-actions">
          <button
            type="button"
            className="mb-lb-share gold-btn"
            onClick={() => {
              if (window.MelakhimAuth && window.MelakhimAuth.shareApp) window.MelakhimAuth.shareApp();
            }}>
            📤 שתף עם השכבה
          </button>
          <button
            type="button"
            className="mb-lb-back"
            onClick={() => setRoute && setRoute({page:'home'})}>
            → חזרה לבית
          </button>
        </div>
      </div>
    );
  }

  function ensureStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('mb-lb-styles')) return;
    const css = `
.mb-leaderboard-root{display:flex;flex-direction:column;gap:14px;direction:rtl;max-width:920px;margin:0 auto}
.mb-leaderboard-root *{box-sizing:border-box}
.mb-lb-head h1{font-size:22px;font-weight:900;color:#F4D58D;margin:0}
.mb-lb-sub{font-size:13px;color:rgba(244,213,141,.75);margin:4px 0 0}
.mb-lb-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:thin}
.mb-lb-tab{flex:0 0 auto;padding:8px 14px;border-radius:999px;border:1px solid rgba(212,165,116,.5);background:rgba(247,241,225,.06);color:#F4D58D;font-size:13px;font-weight:800;cursor:pointer;transition:all .18s;white-space:nowrap}
.mb-lb-tab:hover{background:rgba(212,165,116,.18)}
.mb-lb-tab.active{background:linear-gradient(135deg,#F5D670,#8B6F1F);color:#1A1611;border-color:#C89B3C}
.mb-lb-cta{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px;border-radius:16px;border:1.5px dashed #D4A574;text-align:center}
.mb-lb-cta-text{font-size:14px;font-weight:700;color:#1A1611}
.mb-lb-cta-btn{padding:10px 16px;border-radius:14px;font-weight:800;cursor:pointer}
.mb-lb-warn{padding:14px;border-radius:14px;color:#1A1611;text-align:center;font-size:13px;font-weight:600}
.mb-lb-empty{padding:18px;border-radius:14px;color:#4A3829;text-align:center;font-size:14px}
.mb-lb-skel{padding:14px;border-radius:14px;display:flex;flex-direction:column;gap:10px}
.mb-lb-skel-row{display:flex;align-items:center;gap:10px}
.skel{background:linear-gradient(90deg,rgba(139,111,31,.12),rgba(212,165,116,.22),rgba(139,111,31,.12));background-size:200% 100%;animation:mb-lb-skel 1.4s linear infinite}
@keyframes mb-lb-skel{0%{background-position:200% 0}100%{background-position:-200% 0}}
.mb-lb-table-wrap{padding:6px;border-radius:16px;border:1px solid rgba(212,165,116,.45)}
.mb-lb-table{display:flex;flex-direction:column;gap:2px}
.mb-lb-row{display:grid;grid-template-columns:48px minmax(0,1.6fr) 70px 64px 64px 70px;gap:8px;align-items:center;padding:10px 10px;border-radius:10px;font-size:13px;color:#1A1611}
.mb-lb-row-head{font-weight:900;color:#6B5639;background:rgba(212,165,116,.12);font-size:12px}
.mb-lb-row:not(.mb-lb-row-head):nth-child(odd){background:rgba(247,241,225,.45)}
.mb-lb-row.me{background:linear-gradient(90deg,rgba(245,214,112,.5),rgba(245,214,112,.25));border:1.5px solid #C89B3C;box-shadow:inset 0 0 0 1px rgba(255,255,255,.4)}
.mb-lb-row.top1{background:linear-gradient(90deg,rgba(255,215,0,.35),rgba(255,215,0,.1))}
.mb-lb-row .col-rank{font-weight:900;font-size:15px;text-align:center;color:#8B6F1F}
.mb-lb-row .col-name{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap}
.mb-lb-name{font-weight:800;color:#1A1611;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.mb-lb-classchip{font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;background:rgba(139,111,31,.15);color:#6B5639}
.mb-lb-me{font-size:10px;font-weight:900;padding:2px 7px;border-radius:999px;background:#8B6F1F;color:#F7F1E1}
.mb-lb-row .col-xp,.mb-lb-row .col-units,.mb-lb-row .col-exam,.mb-lb-row .col-active{text-align:center;font-weight:700}
.mb-lb-row .col-xp{color:#8B6F1F;font-weight:900}
.mb-lb-row .col-active{color:#6B5639;font-size:11px}
.mb-lb-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px}
.mb-lb-share{padding:10px 16px;border-radius:14px;font-weight:800;cursor:pointer}
.mb-lb-back{background:transparent;border:none;color:#F4D58D;font-size:13px;font-weight:700;cursor:pointer;padding:6px 8px}
@media (max-width:600px){
  .mb-lb-row{grid-template-columns:36px minmax(0,1.5fr) 56px 50px 50px 60px;font-size:12px;padding:8px 6px;gap:4px}
  .mb-lb-row-head{font-size:11px}
  .mb-lb-name{font-size:13px}
}
`;
    const style = document.createElement('style');
    style.id = 'mb-lb-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  if (typeof window !== 'undefined'){
    ensureStyles();
    window.LeaderboardComponent = Leaderboard;
  }
})();
