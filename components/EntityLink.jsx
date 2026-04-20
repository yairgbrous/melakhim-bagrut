import React, { useState, useRef, useCallback } from 'react';

const TYPE_COLORS = {
  king: '#8B6F1F',
  prophet: '#2563eb',
  place: '#059669',
  event: '#dc2626',
  verse: '#7c3aed',
  unit: '#0891b2',
  motif: '#9333ea',
  date: '#b91c1c',
  character: '#ea580c',
};

const GOLD = '#C9A227';

export function EntityLink({ type, id, label }) {
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const color = TYPE_COLORS[type] || GOLD;

  const summary = (() => {
    if (typeof window === 'undefined') return null;
    const idx = window.__ENTITY_INDEX__;
    if (!idx || !idx[type] || !idx[type][id]) return null;
    return idx[type][id].summary || null;
  })();

  const handleEnter = useCallback(() => {
    setHovered(true);
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setCoords({ x: r.left + r.width / 2, y: r.top });
    }
  }, []);

  const handleLeave = useCallback(() => setHovered(false), []);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (typeof window !== 'undefined' && typeof window.openEntityDrawer === 'function') {
        window.openEntityDrawer(type, id);
      }
    },
    [type, id]
  );

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e);
      }
    },
    [handleClick]
  );

  const chipStyle = {
    display: 'inline',
    cursor: 'pointer',
    color,
    borderBottom: `1px dashed ${GOLD}`,
    padding: '0 2px',
    fontWeight: 600,
    background: 'transparent',
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
    backgroundColor: hovered ? 'rgba(201, 162, 39, 0.12)' : 'transparent',
  };

  const tooltipStyle = {
    position: 'fixed',
    left: coords.x,
    top: coords.y - 8,
    transform: 'translate(-50%, -100%)',
    background: '#1f2937',
    color: '#f9fafb',
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 12,
    maxWidth: 280,
    lineHeight: 1.4,
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    pointerEvents: 'none',
    zIndex: 9999,
    whiteSpace: 'normal',
  };

  return (
    <>
      <span
        ref={ref}
        role="link"
        tabIndex={0}
        data-entity-type={type}
        data-entity-id={id}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        onClick={handleClick}
        onKeyDown={handleKey}
        style={chipStyle}
        title={summary || label}
      >
        {label}
      </span>
      {hovered && summary ? <span style={tooltipStyle}>{summary}</span> : null}
    </>
  );
}

const TOKEN_RE = /\{\{([a-z]+):([^|}]+)\|([^}]+)\}\}/g;

export function parseTokens(text) {
  if (typeof text !== 'string' || !text) return text;
  const nodes = [];
  let last = 0;
  let match;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    const [full, type, id, label] = match;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (TYPE_COLORS[type]) {
      nodes.push(
        <EntityLink key={`el-${key++}`} type={type} id={id.trim()} label={label.trim()} />
      );
    } else {
      nodes.push(full);
    }
    last = match.index + full.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length === 1 ? nodes[0] : nodes;
}

export default EntityLink;
