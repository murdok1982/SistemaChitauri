import React from 'react';

const THREAT_LEVELS = [
  { id: 'BAJO', label: 'BAJO', color: '#00ff41', pct: 10 },
  { id: 'MODERADO', label: 'MODERADO', color: '#7fff00', pct: 30 },
  { id: 'ELEVADO', label: 'ELEVADO', color: '#ffd700', pct: 55 },
  { id: 'ALTO', label: 'ALTO', color: '#ff8c00', pct: 75 },
  { id: 'CRITICO', label: 'CRITICO', color: '#ff0000', pct: 95 },
];

const INTEL_TYPE_COLORS = {
  IMINT: '#00a3ff',
  SIGINT: '#00ff41',
  HUMINT: '#ffd700',
  CYBER: '#9400d3',
  OSINT: '#ff8c00',
};

function ThreatLevelBar({ level }) {
  const def = THREAT_LEVELS.find((t) => t.id === level) || THREAT_LEVELS[1];

  return (
    <div className="threat-block">
      <div className="threat-header">
        <span className="threat-label">NIVEL DE AMENAZA</span>
        <span className="threat-value" style={{ color: def.color }}>
          {def.label}
        </span>
      </div>
      <div className="threat-bar-bg">
        <div
          className="threat-bar-fill"
          style={{
            width: `${def.pct}%`,
            background: `linear-gradient(90deg, rgba(0,255,65,0.3), ${def.color})`,
            boxShadow: `0 0 8px ${def.color}`,
          }}
        />
      </div>
      <div className="threat-scale">
        {THREAT_LEVELS.map((t) => (
          <span
            key={t.id}
            style={{
              color: t.id === level ? t.color : 'rgba(255,255,255,0.25)',
              fontWeight: t.id === level ? 'bold' : 'normal',
              fontSize: '0.65rem',
            }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function IntSumBlock({ intsum }) {
  if (!intsum) {
    return (
      <div className="intsum-block">
        <div className="intel-section-title">INTSUM ACTUAL</div>
        <div className="intsum-empty">SIN INTSUM GENERADO — PENDIENTE ANALISIS</div>
      </div>
    );
  }

  return (
    <div className="intsum-block">
      <div className="intel-section-title">
        INTSUM #{intsum.id}
        <span className="intsum-ts">{intsum.timestamp}</span>
      </div>
      <div className="intsum-content">{intsum.content}</div>
      <div className="intsum-classification" style={{ color: '#ff0000' }}>
        [{intsum.classification || 'CLASIFICADO'}]
      </div>
    </div>
  );
}

function PirList({ pirs }) {
  return (
    <div className="pir-block">
      <div className="intel-section-title">
        PIRs ACTIVOS
        <span className="pir-count">{pirs.length}</span>
      </div>
      {pirs.length === 0 && (
        <div className="intsum-empty">SIN PIRs ACTIVOS</div>
      )}
      {pirs.map((pir, i) => (
        <div key={pir.id || i} className="pir-item">
          <span className="pir-num">P{String(i + 1).padStart(2, '0')}</span>
          <span className="pir-text">{pir.description || pir.text}</span>
          <span
            className="pir-priority"
            style={{
              color: pir.priority === 'HIGH' ? '#ff6b35' : pir.priority === 'CRITICAL' ? '#ff0000' : '#ffd700',
            }}
          >
            {pir.priority}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReportList({ reports }) {
  const byType = {};
  ['IMINT', 'SIGINT', 'HUMINT', 'CYBER', 'OSINT'].forEach((t) => {
    byType[t] = reports.filter((r) => r.type === t);
  });

  return (
    <div className="report-block">
      <div className="intel-section-title">ULTIMOS REPORTES POR DISCIPLINA</div>
      <div className="report-type-grid">
        {Object.entries(byType).map(([type, reps]) => (
          <div key={type} className="report-type-col">
            <div
              className="report-type-header"
              style={{ color: INTEL_TYPE_COLORS[type], borderColor: INTEL_TYPE_COLORS[type] }}
            >
              {type}
              <span className="report-count">{reps.length}</span>
            </div>
            {reps.slice(0, 2).map((rep, i) => (
              <div key={i} className="report-item">
                <span className="report-ts">{rep.timestamp ? new Date(rep.timestamp).toLocaleTimeString('es-ES') : '--:--'}</span>
                <span className="report-msg">{rep.summary || rep.message || 'SIN RESUMEN'}</span>
              </div>
            ))}
            {reps.length === 0 && (
              <div className="report-empty">SIN DATOS</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IntelPanel({ threatLevel, intsum, pirs, reports, onGenerateBriefing }) {
  return (
    <div className="intel-panel">
      <div className="panel-header">
        <span className="panel-title">PRODUCTOS DE INTELIGENCIA</span>
        <span className="panel-badge">INTEL</span>
      </div>

      <ThreatLevelBar level={threatLevel} />

      <IntSumBlock intsum={intsum} />

      <PirList pirs={pirs} />

      <ReportList reports={reports} />

      <button
        className="briefing-btn"
        onClick={onGenerateBriefing}
        aria-label="Generar briefing estrategico con ARES"
      >
        <span className="briefing-btn-icon">▶</span>
        GENERAR BRIEFING ESTRATEGICO
      </button>
    </div>
  );
}
