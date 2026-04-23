/* =========================================================================
   ThemeToggle — sun/moon icon rendered in the app header.
   Persists the selected theme to localStorage['jarvis.theme'].
   Toggles document.documentElement[data-theme] between 'light' and 'dark'.
   Emits 'jarvis-theme-change' CustomEvent so other listeners (drawer, App)
   can re-render in sync.
   Exposes: window.ThemeToggleComponent (React component)
            window.toggleJarvisTheme() (imperative)
            window.getJarvisTheme() -> 'light' | 'dark'
   ========================================================================= */
(function(){
  const KEY = 'jarvis.theme';

  function readSaved(){
    try { return localStorage.getItem(KEY); } catch { return null; }
  }
  function writeSaved(t){
    try { localStorage.setItem(KEY, t); } catch {}
  }
  function current(){
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  function apply(t){
    document.documentElement.setAttribute('data-theme', t);
    try { window.dispatchEvent(new CustomEvent('jarvis-theme-change', { detail: { theme: t } })); } catch {}
  }
  function toggle(){
    const next = current() === 'dark' ? 'light' : 'dark';
    writeSaved(next);
    apply(next);
    return next;
  }

  window.getJarvisTheme = current;
  window.toggleJarvisTheme = toggle;

  function ThemeToggle(){
    const [theme, setTheme] = React.useState(current);
    React.useEffect(() => {
      const onChange = (e) => {
        const t = (e && e.detail && e.detail.theme) || current();
        setTheme(t);
      };
      window.addEventListener('jarvis-theme-change', onChange);
      return () => window.removeEventListener('jarvis-theme-change', onChange);
    }, []);
    const onClick = () => { toggle(); };
    const isDark = theme === 'dark';
    return React.createElement('button', {
      type: 'button',
      onClick: onClick,
      className: 'theme-tog',
      'aria-label': isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה',
      'aria-pressed': isDark,
      title: isDark ? 'מצב בהיר' : 'מצב כהה'
    }, isDark ? '☀️' : '🌙');
  }

  window.ThemeToggleComponent = ThemeToggle;
})();
