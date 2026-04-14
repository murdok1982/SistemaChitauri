import React, { useEffect, useRef, useState } from 'react';

const SEVERITY_COLORS = {
  CRITICAL: '#ff0000',
  HIGH: '#ff6b35',
  MEDIUM: '#ffd700',
  LOW: '#00ff41',
  INFO: '#00a3ff',
};

const TYPE_PREFIX = {
  RF_ANOMALY: 'RF-ANOM',
  CV_MATCH: 'CV-MATCH',
  GEO_FENCE: 'GEO-FEN',
  SYSTEM: 'SYS',
  INTEL: 'INTEL',
  SENSOR: 'SENSOR',
};

function formatTickerItem(event) {
  const ts = event.timestamp
    ? new Date(event.timestamp).toLocaleTimeString('es-ES', { hour12: false })
    : '--:--:--';
  const type = TYPE_PREFIX[event.type] || event.type || 'EVT';
  const asset = event.asset_id || event.assetId || '---';
  const msg = event.message || event.msg || 'SIN DESCRIPCION';
  return `[${ts}] [${type}] [${asset}] ${msg}`;
}

export default function AlertTicker({ events }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // La animacion scroll es puramente CSS, el ref solo sirve para pause toggle
  const items = events.length > 0 ? events : [
    {
      id: 'default-1',
      severity: 'INFO',
      type: 'SYSTEM',
      asset_id: 'SESIS',
      message: 'Sistema inicializado. Aguardando eventos en tiempo real...',
      timestamp: new Date().toISOString(),
    },
  ];

  // Duplicar para loop continuo
  const doubled = [...items, ...items];

  return (
    <div
      className="alert-ticker-wrapper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      title="Pasa el cursor para pausar"
    >
      <div className="ticker-label">
        <span className="ticker-label-text">FEED EN VIVO</span>
        <span className={`ticker-live-dot ${paused ? '' : 'ticker-dot-pulse'}`} />
      </div>
      <div className="ticker-scroll-container">
        <div
          ref={trackRef}
          className="ticker-track"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {doubled.map((event, idx) => {
            const color = SEVERITY_COLORS[event.severity] || '#94a3b8';
            return (
              <span
                key={`${event.id || idx}-${idx}`}
                className="ticker-item"
                style={{ color, borderColor: `${color}44` }}
              >
                <span
                  className="ticker-severity"
                  style={{ background: `${color}22`, color }}
                >
                  {event.severity || 'INFO'}
                </span>
                {formatTickerItem(event)}
              </span>
            );
          })}
        </div>
      </div>
      {paused && (
        <div className="ticker-paused-badge">PAUSADO</div>
      )}
    </div>
  );
}
