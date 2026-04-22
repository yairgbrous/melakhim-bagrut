function BreadthPage() {
  const topics = window.BREADTH_DATA || [
    {id:'sibatiyut_kfula',title:'עקרון הסיבתיות הכפולה'},
    {id:'manhig',title:'מנהיג ומנהיגות'},
    {id:'mikdash',title:'בית המקדש'},
    {id:'melech_navi',title:'מלך ונביא'},
    {id:'israel_goyim',title:'ישראל והעמים'},
    {id:'ahdut_pilug',title:'אחדות ופילוג'},
    {id:'ruchani_medini',title:'מצב רוחני-מדיני'}
  ];
  const items = window.RECURRING_ITEMS_DATA || [];
  return React.createElement('div', {className:'space-y-6 p-2'},
    React.createElement('div', null,
      React.createElement('h1', {className:'font-display text-2xl md:text-3xl font-bold text-amber-300'}, '🌐 נושאי רוחב במיקוד'),
      React.createElement('p', {className:'text-amber-100/70 text-sm mt-1'}, '7 נושאי רוחב + חפצים וביטויים חוזרים לאורך ספר מלכים')
    ),
    React.createElement('section', {className:'space-y-3'},
      React.createElement('h2', {className:'font-display text-xl font-bold text-amber-200'}, '📖 שבעת נושאי הרוחב'),
      React.createElement('div', {className:'grid grid-cols-1 md:grid-cols-2 gap-3'},
        topics.map(t => React.createElement('div', {key:t.id, className:'card rounded-2xl p-4 text-right'},
          React.createElement('h3', {className:'font-display text-lg font-bold text-amber-200'}, t.title)
        ))
      )
    ),
    React.createElement('section', {className:'space-y-3'},
      React.createElement('h2', {className:'font-display text-xl font-bold text-amber-200'}, '📿 חפצים וביטויים חוזרים'),
      items.length
        ? React.createElement('div', {className:'grid grid-cols-1 md:grid-cols-2 gap-3'},
            items.map(i => React.createElement('div', {key:i.id, className:'card rounded-2xl p-4 text-right'},
              React.createElement('h3', {className:'font-display text-base font-bold text-amber-200'}, i.name_niqqud || i.name)
            ))
          )
        : React.createElement('div', {className:'card rounded-xl p-6 text-center text-amber-100/70'}, 'יוצג ברגע שהנתונים ייטענו')
    )
  );
}
window.BreadthPage = BreadthPage;
