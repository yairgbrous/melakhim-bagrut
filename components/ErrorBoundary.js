/* =========================================================================
   ErrorBoundary — wraps Router children and renders a friendly Hebrew
   fallback screen on any render/lifecycle error.
   Actions:
     • "חזור לבית"   — resets state + navigates back to the home route
     • "דווח על שגיאה" — opens mailto:yairgbrous@gmail.com with the full
                        trace (message, JS stack, component stack, URL, UA).
   Exposes: window.ErrorBoundaryComponent
   ========================================================================= */
(function(){
  const REPORT_EMAIL = 'yairgbrous@gmail.com';

  function buildTrace(err, info){
    const parts = [
      'שגיאה: ' + String((err && err.message) || err || '(ללא פרטים)'),
      '',
      'Stack:',
      (err && err.stack) || '(ללא)',
      '',
      'Component stack:',
      (info && info.componentStack) || '(ללא)',
      '',
      '— מטא —',
      'URL: ' + (typeof location !== 'undefined' ? location.href : ''),
      'UA: ' + (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      'Time: ' + new Date().toISOString()
    ];
    return parts.join('\n');
  }

  class ErrorBoundary extends React.Component {
    constructor(props){
      super(props);
      this.state = { err: null, info: null };
      this.goHome = this.goHome.bind(this);
      this.report = this.report.bind(this);
    }
    static getDerivedStateFromError(err){ return { err: err }; }
    componentDidCatch(err, info){
      this.setState({ info: info });
      try { console.error('[ErrorBoundary]', err, info); } catch {}
    }
    goHome(){
      if (typeof this.props.onHome === 'function') {
        try { this.props.onHome(); } catch {}
        this.setState({ err: null, info: null });
        return;
      }
      try {
        try { window.location.hash = ''; } catch {}
        this.setState({ err: null, info: null });
        setTimeout(() => { try { window.location.reload(); } catch {} }, 0);
      } catch {
        try { window.location.reload(); } catch {}
      }
    }
    report(){
      const trace = buildTrace(this.state.err, this.state.info);
      const subject = '[ספר מלכים] דיווח על שגיאה';
      const href = 'mailto:' + REPORT_EMAIL
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(trace);
      try { window.location.href = href; } catch {}
    }
    render(){
      if (!this.state.err) return this.props.children;
      const msg = String((this.state.err && this.state.err.message) || this.state.err || '');
      return React.createElement('div', { className: 'eb-screen', role: 'alert', 'aria-live': 'assertive', dir: 'rtl' },
        React.createElement('div', { className: 'eb-card' },
          React.createElement('div', { className: 'eb-icon', 'aria-hidden': 'true' }, '😕'),
          React.createElement('h1', { className: 'eb-title' }, 'משהו השתבש'),
          React.createElement('p', { className: 'eb-msg' },
            'אירעה שגיאה בלתי צפויה. אפשר לחזור לדף הבית ולנסות שוב, או לדווח לנו כדי שנתקן במהרה.'
          ),
          msg ? React.createElement('pre', { className: 'eb-trace', 'aria-label': 'פרטי שגיאה' }, msg) : null,
          React.createElement('div', { className: 'eb-actions' },
            React.createElement('button', {
              type: 'button', onClick: this.goHome,
              className: 'eb-btn eb-btn-primary',
              'aria-label': 'חזור לדף הבית'
            }, '🏠 חזור לבית'),
            React.createElement('button', {
              type: 'button', onClick: this.report,
              className: 'eb-btn eb-btn-secondary',
              'aria-label': 'דווח על השגיאה במייל'
            }, '📧 דווח על שגיאה')
          )
        )
      );
    }
  }

  window.ErrorBoundaryComponent = ErrorBoundary;
})();
