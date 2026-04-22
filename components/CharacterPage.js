/* =========================================================================
   CharacterPage — full-page view for a biblical character/king/prophet.
   Reachable via route {page:'character', id}. Uses window.__ENTITY_INDEX__
   when available; falls back to KingsUtils fallback tables (prophets, kings
   from MELAKHIM_DATA.timeline). NO emoji status — relies on color classes.
   Exposes: window.CharacterPageComponent
   ========================================================================= */
(function(){
  const { useMemo } = React;

  const stripTokens = (t) => {
    if (window.KingsUtils && window.KingsUtils.stripTokens) return window.KingsUtils.stripTokens(t);
    if (typeof t !== 'string') return t || '';
    return t.replace(/\{\{[a-zA-Zא-ת_]+:[^|}]+\|([^}]+)\}\}/g, '$1');
  };

  function findKingByName(name){
    try{
      const tl = (typeof MELAKHIM_DATA !== 'undefined') ? (MELAKHIM_DATA.timeline||[]) : [];
      const i = tl.findIndex(k => k.name === name);
      if (i < 0) return null;
      const k = tl[i];
      return { id:'tl-'+i+'-'+k.name.replace(/\s/g,'-'), name:k.name, dynasty:k.dynasty, good:k.good, years:k.years, period:k.period, notes:k.notes };
    }catch(e){ return null; }
  }

  function allKings(){
    const idx = (window.__ENTITY_INDEX__ || {});
    const live = idx.king ? Object.values(idx.king) : [];
    if (live.length) return live.map(k => ({
      id:k.id, name:k.name||k.heading||k.id,
      dynasty: k.kingdom==='israel' ? 'ישראל' : (k.kingdom==='judah' ? 'יהודה' : (k.dynasty||'יהודה')),
      good: k.assessment==='righteous' ? true : (k.assessment==='wicked' ? false : !!k.good),
      years:k.reign_years||k.years||'', period:k.period||'', notes:k.summary||k.notes||''
    }));
    const tl = (typeof MELAKHIM_DATA !== 'undefined') ? (MELAKHIM_DATA.timeline||[]) : [];
    return tl.map((k,i)=>({ id:'tl-'+i+'-'+k.name.replace(/\s/g,'-'), ...k }));
  }

  function resolveCharacter(id){
    const KU = window.KingsUtils;
    if (KU && KU.getCharacter){
      const c = KU.getCharacter(id);
      if (c) return c;
    }
    // try kings index / timeline by id
    const k = allKings().find(k => k.id === id);
    if (k) return { id:k.id, name:k.name, role:'מלך', kingdom:k.dynasty, era:k.years ? (k.years+' שנות מלוכה') : '', bio:'', _king:k };
    return null;
  }

  function KingAssess({k}){
    const KU = window.KingsUtils;
    const col = (KU && KU.assessmentColor) ? KU.assessmentColor(k) : {cls:'assess-mixed',hex:'#8b6d2d'};
    const lbl = col.cls==='assess-tzadik'?'צדיק':col.cls==='assess-rasha'?'רשע':'מעורב';
    return <span className={"kt-assess-pill " + col.cls} style={{marginInlineStart:8}}>{lbl}</span>;
  }

  function Chip({label, onClick, tone}){
    const cls = tone ? ('kt-chip kt-chip-'+tone) : 'kt-chip';
    return <button className={cls} onClick={onClick}>{label}</button>;
  }

  function Section({title, children}){
    if (!children || (Array.isArray(children) && children.every(x=>!x))) return null;
    return <div className="kt-sect"><div className="kt-sect-h">{title}</div>{children}</div>;
  }

  function CharacterPage({ id, setRoute }){
    const c = useMemo(() => resolveCharacter(id), [id]);
    const KU = window.KingsUtils;
    const kings = useMemo(() => allKings(), [id]);

    if (!c){
      return (
        <div className="max-w-3xl mx-auto space-y-4">
          <button onClick={()=>setRoute({page:'timeline'})} className="text-amber-300 text-sm">→ חזרה לציר המלכים</button>
          <div className="parchment rounded-2xl p-6 text-center">
            <div style={{fontSize:42,marginBottom:6}}>📜</div>
            <div className="font-bold text-amber-900">דמות לא נמצאה</div>
            <div className="text-amber-800 text-sm mt-2">מזהה: <code>{id||'—'}</code></div>
          </div>
        </div>
      );
    }

    const isKing = !!c._king || /מלך|king/i.test(c.role||'');
    const k = c._king || (kings.find(x => x.id === c.id) || null);

    const prophets = (k && KU && KU.prophets_by_reign) ? KU.prophets_by_reign(Object.values((window.__ENTITY_INDEX__||{}).character||{}), k) : [];
    const foreign  = (k && KU && KU.foreign_event_for) ? KU.foreign_event_for(k) : null;
    const killedBy = (k && KU) ? KU.killed_by(kings, k.id) : [];
    const killedOf = (k && KU) ? KU.killed(kings, k.id)    : [];

    const dyn = (k && KU && KU.dynastyBadge) ? KU.dynastyBadge(k) : null;
    const bio = stripTokens(c.bio || c.summary || c.description || '');
    const quotesBy = c.quotes_by || c.quotes || [];
    const quotesTo = c.quotes_to || [];
    const places   = c.related_places || c.places || [];
    const events   = c.related_events || c.events || [];
    const breadth  = c.breadth_topics || c.breadth || [];
    const units    = c.units || (c.unit ? [c.unit] : []);

    const goChar = (cid) => setRoute({page:'character', id:cid});
    const firePractice = () => {
      try{ window.dispatchEvent(new CustomEvent('practice-entity', {detail:{type:(isKing?'king':'character'), id:c.id}})); }catch(e){}
    };

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={()=>setRoute({page:'timeline'})} className="text-amber-300 text-sm">→ חזרה לציר המלכים</button>

        <div className="parchment rounded-2xl p-5 md:p-6">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black text-amber-900 hebrew">
                {c.name || c.heading || c.id}
                {isKing && k && <KingAssess k={k}/>}
              </h1>
              <div className="text-amber-800 text-sm mt-1">
                {c.role && <span>{c.role}</span>}
                {c.kingdom && <span> · {c.kingdom}</span>}
                {c.era && <span> · {c.era}</span>}
                {k && k.years && <span> · {k.years} שנות מלוכה</span>}
                {dyn && <span> · {dyn.name}</span>}
              </div>
              {units && units.length>0 && <div className="text-xs text-amber-700 mt-1">יחידות: {units.join(', ')}</div>}
            </div>
            <button onClick={firePractice} className="gold-btn px-4 py-2 rounded-xl font-bold">⚔️ תרגל על דמות זו</button>
          </div>
        </div>

        <div className="kt-expanded rounded-2xl" style={{border:'1px solid rgba(212,165,116,.25)'}}>
          {bio && <Section title="📖 ביוגרפיה"><p className="kt-bio">{bio}</p></Section>}
          {k && k.notes && !bio && <Section title="📖 תקציר"><p className="kt-bio">{stripTokens(k.notes)}</p></Section>}

          {c.key_actions && c.key_actions.length>0 && (
            <Section title="⚡ מעשים מרכזיים">
              <ul className="kt-actions">{c.key_actions.map((a,i)=><li key={i}>{stripTokens(a)}</li>)}</ul>
            </Section>
          )}

          {prophets.length>0 && (
            <Section title="🔮 נביאים בעת מלכותו">
              <div className="kt-chips">{prophets.map(p => <Chip key={p.id} tone="prophet" label={p.name} onClick={()=>goChar(p.id)}/>)}</div>
            </Section>
          )}

          {foreign && (
            <Section title="🌍 מעצמות זרות">
              <div className="kt-foreign-chip">{foreign.name} ({foreign.empire}) — {foreign.event} · {foreign.book_ref}</div>
            </Section>
          )}

          {(killedBy.length>0 || killedOf.length>0) && (
            <Section title="⚔️ קשרי רצח">
              {killedBy.length>0 && (
                <div className="kt-kill-row">
                  <span className="kt-kill-row-label">נהרג על ידי:</span>
                  {killedBy.map((p,i)=>(
                    <span key={i} className="kt-kill-chip" onClick={()=>p.killer_id && goChar(p.killer_id)}>
                      {p.killer_name}{p.note?` (${p.note})`:''}
                    </span>
                  ))}
                </div>
              )}
              {killedOf.length>0 && (
                <div className="kt-kill-row">
                  <span className="kt-kill-row-label">הרג את:</span>
                  {killedOf.map((p,i)=>(
                    <span key={i} className="kt-kill-chip" onClick={()=>goChar(p.victim_id)}>{p.victim_name}</span>
                  ))}
                </div>
              )}
            </Section>
          )}

          {quotesBy.length>0 && (
            <Section title="💬 ציטוטים שאמר/ה">
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {quotesBy.map((q,i)=>(
                  <div key={i} className="kt-quote-cite">
                    <div>„{stripTokens(q.text || q)}"</div>
                    {q.ref && <div style={{fontSize:11,opacity:.7,marginTop:3}}>{q.ref}</div>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {quotesTo.length>0 && (
            <Section title="💬 ציטוטים שנאמרו אליו/אליה">
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {quotesTo.map((q,i)=>(
                  <div key={i} className="kt-quote-cite">
                    <div>„{stripTokens(q.text || q)}"</div>
                    {q.ref && <div style={{fontSize:11,opacity:.7,marginTop:3}}>{q.ref}</div>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {places.length>0 && (
            <Section title="📍 מקומות">
              <div className="kt-chips">{places.map((p,i)=><Chip key={i} tone="place" label={p.label||p.name||p}/>)}</div>
            </Section>
          )}

          {events.length>0 && (
            <Section title="📜 אירועים">
              <div className="kt-chips">{events.map((p,i)=><Chip key={i} tone="event" label={p.label||p.title||p}/>)}</div>
            </Section>
          )}

          {breadth.length>0 && (
            <Section title="🌐 נושאי רוחב">
              <div className="kt-chips">{breadth.map((p,i)=><Chip key={i} label={p.label||p.name||p}/>)}</div>
            </Section>
          )}

          {c.tags && c.tags.length>0 && (
            <Section title="🏷 תגיות">
              <div className="kt-chips">{c.tags.map((t,i)=><Chip key={i} label={t}/>)}</div>
            </Section>
          )}
        </div>
      </div>
    );
  }

  window.CharacterPageComponent = CharacterPage;
})();
