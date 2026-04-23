/* =========================================================================
   Toast — global notification system.

   Public API:
     window.showToast(msg, variant?)
       msg     : string
       variant : 'success' | 'error' | 'info'   (default: 'info')

   Also listens globally for window 'practice-entity' CustomEvents so the
   existing "⚔️ תרגל על X" buttons (KingsTable, CharacterPage, EventPage,
   BreadthPage) automatically surface feedback when a practice run starts.

   Exposes: window.ToastHostComponent — mount once near the root.
   ========================================================================= */
(function(){
  const MAX_TOASTS = 4;
  const DEFAULT_MS = 3200;

  function ToastHost(){
    const [items, setItems] = React.useState([]);

    const remove = React.useCallback((id) => {
      setItems(prev => prev.filter(t => t.id !== id));
    }, []);

    const push = React.useCallback((msg, variant) => {
      const v = (variant === 'success' || variant === 'error' || variant === 'info') ? variant : 'info';
      const id = Date.now() + Math.random();
      setItems(prev => {
        const next = [...prev, { id, msg: String(msg), variant: v, ts: Date.now() }];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });
      setTimeout(() => remove(id), DEFAULT_MS);
      return id;
    }, [remove]);

    React.useEffect(() => {
      window.showToast = (msg, variant) => push(msg, variant);

      const onPractice = (e) => {
        const d = e && e.detail;
        if (!d) return;
        const label = d.label || d.name || '';
        push('⚔️ נטען תרגול' + (label ? ' על ' + label : ''), 'info');
      };
      window.addEventListener('practice-entity', onPractice);

      return () => {
        window.removeEventListener('practice-entity', onPractice);
        if (window.showToast === push) delete window.showToast;
      };
    }, [push]);

    if (items.length === 0) return null;

    return React.createElement('div', {
      className: 'toast-host',
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    }, items.map(t =>
      React.createElement('div', {
        key: t.id,
        className: 'toast-item toast-' + t.variant,
        onClick: () => remove(t.id)
      },
        React.createElement('span', { className: 'toast-ico', 'aria-hidden': 'true' },
          t.variant === 'success' ? '✅' : t.variant === 'error' ? '⚠️' : 'ℹ️'
        ),
        React.createElement('span', { className: 'toast-msg' }, t.msg)
      )
    ));
  }

  window.ToastHostComponent = ToastHost;
})();
