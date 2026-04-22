(function(){
  const {useState, useMemo} = React;

  const UNITS = [
    {id:1, num:'א', title:'מלכות שלמה'},
    {id:2, num:'ב', title:'פילוג הממלכה'},
    {id:3, num:'ג', title:'אליהו ואחאב'},
    {id:4, num:'ד', title:'מהפכות ותמורות'},
    {id:5, num:'ה', title:'הכיבוש האשורי'},
    {id:6, num:'ו', title:'סוף יהודה'}
  ];

  const BREADTH_FALLBACK = [
    // topics inserted incrementally
  ];

  const RECURRING_FALLBACK = [
    // items inserted incrementally
  ];

  function FilterChips({filter, setFilter}){
    return React.createElement('div', {className:'flex flex-wrap gap-1.5'},
      React.createElement('button', {onClick:()=>setFilter(0), className:'px-3 py-1.5 rounded-lg text-xs font-bold '+(filter===0?'tab-active':'card')}, 'הכל'),
      UNITS.map(u => React.createElement('button', {key:u.id, onClick:()=>setFilter(u.id), className:'px-3 py-1.5 rounded-lg text-xs font-bold '+(filter===u.id?'tab-active':'card')}, 'יחידה '+u.num))
    );
  }

  function TopicCard({t, isOpen, onToggle, gotoUnit}){
    return React.createElement('div', {className:'card rounded-2xl p-4 text-right'},
      React.createElement('button', {type:'button', onClick:onToggle, className:'w-full text-right block'},
        React.createElement('h3', {className:'font-display text-lg font-bold text-amber-200'}, t.title),
        t.intro && React.createElement('p', {className:'text-amber-100/80 text-sm mt-1.5 leading-relaxed'}, t.intro),
        t.unit_coverage && React.createElement('div', {className:'flex flex-wrap gap-1 mt-2'},
          t.unit_coverage.map(uId => {
            const u = UNITS.find(x=>x.id===uId);
            return u ? React.createElement('span', {key:uId, className:'text-[10px] px-2 py-0.5 rounded-full bg-amber-700/30 text-amber-200'}, "יח' "+u.num) : null;
          })
        )
      ),
      isOpen && React.createElement('div', {className:'mt-3 pt-3 border-t border-amber-700/30 space-y-3'},
        t.key_instances && t.key_instances.length>0 && React.createElement('div', null,
          React.createElement('div', {className:'text-xs font-bold text-amber-300 mb-1'}, '📌 דוגמאות מהספר'),
          React.createElement('ul', {className:'space-y-1.5 text-sm'},
            t.key_instances.map((ki,i)=>React.createElement('li', {key:i},
              React.createElement('button', {type:'button', onClick:()=>gotoUnit(ki.unitId), className:'text-amber-200 hover:underline text-right'},
                '• ' + ki.label + (ki.unit?' (יחידה '+ki.unit+')':'')
              )
            ))
          )
        ),
        t.questions && t.questions.length>0 && React.createElement('div', null,
          React.createElement('div', {className:'text-xs font-bold text-amber-300 mb-1'}, '💭 שאלות לדיון'),
          React.createElement('ol', {className:'list-decimal pr-5 space-y-1 text-sm text-amber-100/90'},
            t.questions.map((q,i)=>React.createElement('li', {key:i}, q))
          )
        )
      )
    );
  }

  function ItemCard({it, isOpen, onToggle, gotoUnit}){
    const count = (it.instances||[]).length;
    return React.createElement('div', {className:'card rounded-2xl p-4 text-right'},
      React.createElement('button', {type:'button', onClick:onToggle, className:'w-full text-right block'},
        React.createElement('div', {className:'flex items-center justify-between gap-2'},
          React.createElement('h3', {className:'font-display text-base font-bold text-amber-200 hebrew'}, it.name_niqqud || it.name),
          count>0 && React.createElement('span', {className:'text-[10px] px-2 py-0.5 rounded-full bg-amber-700/30 text-amber-200 shrink-0'}, count+' הופעות')
        )
      ),
      isOpen && React.createElement('div', {className:'mt-3 pt-3 border-t border-amber-700/30 space-y-2'},
        it.instances && it.instances.length>0 && React.createElement('ul', {className:'space-y-1.5 text-sm'},
          it.instances.map((ins,i)=>React.createElement('li', {key:i},
            React.createElement('button', {type:'button', onClick:()=>gotoUnit(ins.unitId), className:'text-amber-200 hover:underline text-right'},
              '• יחידה '+(ins.unit||'')+' — '+ins.context
            )
          ))
        ),
        it.significance && React.createElement('p', {className:'text-xs text-amber-100/80 leading-relaxed pt-1 border-t border-amber-700/20 mt-2'},
          React.createElement('strong', {className:'text-amber-300'}, 'משמעות: '),
          it.significance
        )
      )
    );
  }

  function BreadthPage(props){
    const setRoute = (props && props.setRoute) || (typeof window!=='undefined' ? window.__setRoute : null);
    const topics = (window.BREADTH_DATA && window.BREADTH_DATA.length) ? window.BREADTH_DATA : BREADTH_FALLBACK;
    const items = (window.RECURRING_ITEMS_DATA && window.RECURRING_ITEMS_DATA.length) ? window.RECURRING_ITEMS_DATA : RECURRING_FALLBACK;
    const [filter, setFilter] = useState(0);
    const [openTopic, setOpenTopic] = useState(null);
    const [openItem, setOpenItem] = useState(null);

    const filteredTopics = useMemo(()=> filter===0 ? topics : topics.filter(t => (t.unit_coverage||[]).includes(filter)), [filter, topics]);
    const filteredItems = useMemo(()=> filter===0 ? items : items.filter(i => (i.instances||[]).some(inst => inst.unitId === filter)), [filter, items]);

    const gotoUnit = id => { if (setRoute && id) setRoute({page:'unit', unitId:id}); };

    return React.createElement('div', {className:'space-y-6 p-2'},
      React.createElement('div', null,
        React.createElement('h1', {className:'font-display text-2xl md:text-3xl font-bold text-amber-300'}, '🌐 נושאי רוחב במיקוד'),
        React.createElement('p', {className:'text-amber-100/70 text-sm mt-1'}, '7 נושאי רוחב + חפצים וביטויים חוזרים לאורך ספר מלכים')
      ),
      React.createElement(FilterChips, {filter, setFilter}),
      React.createElement('section', {className:'space-y-3'},
        React.createElement('h2', {className:'font-display text-xl font-bold text-amber-200'}, '📖 שבעת נושאי הרוחב'),
        filteredTopics.length === 0
          ? React.createElement('div', {className:'card rounded-xl p-6 text-center text-amber-100/70'}, 'אין נושא רוחב מתאים לסינון זה')
          : React.createElement('div', {className:'grid grid-cols-1 md:grid-cols-2 gap-3'},
              filteredTopics.map(t => React.createElement(TopicCard, {
                key:t.id, t:t, isOpen:openTopic===t.id,
                onToggle:()=>setOpenTopic(openTopic===t.id?null:t.id), gotoUnit
              }))
            )
      ),
      React.createElement('section', {className:'space-y-3'},
        React.createElement('h2', {className:'font-display text-xl font-bold text-amber-200'}, '📿 חפצים וביטויים חוזרים'),
        filteredItems.length === 0
          ? React.createElement('div', {className:'card rounded-xl p-6 text-center text-amber-100/70'}, 'יוצג ברגע שהנתונים ייטענו')
          : React.createElement('div', {className:'grid grid-cols-1 md:grid-cols-2 gap-3'},
              filteredItems.map(it => React.createElement(ItemCard, {
                key:it.id, it:it, isOpen:openItem===it.id,
                onToggle:()=>setOpenItem(openItem===it.id?null:it.id), gotoUnit
              }))
            )
      )
    );
  }

  window.BreadthPage = BreadthPage;
})();
