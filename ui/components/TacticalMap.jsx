import React, { useMemo } from 'react';

// Bounding box del mapa: zona España centro
const MAP_CONFIG = {
  latMin: 39.8,
  latMax: 41.0,
  lonMin: -4.2,
  lonMax: -3.0,
  width: 700,
  height: 480,
};

function latToY(lat) {
  const ratio = (MAP_CONFIG.latMax - lat) / (MAP_CONFIG.latMax - MAP_CONFIG.latMin);
  return ratio * MAP_CONFIG.height;
}

function lonToX(lon) {
  const ratio = (lon - MAP_CONFIG.lonMin) / (MAP_CONFIG.lonMax - MAP_CONFIG.lonMin);
  return ratio * MAP_CONFIG.width;
}

const ASSET_ICONS = {
  satellite: {
    label: 'SAT',
    render: (x, y, color, pulse) => (
      <g key={`sat-${x}-${y}`} transform={`translate(${x}, ${y})`}>
        {pulse && (
          <circle r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
        <polygon
          points="0,-10 8,4 -8,4"
          fill={color}
          stroke="#0a0d0f"
          strokeWidth="1"
          transform="rotate(45)"
        />
        <line x1="-10" y1="0" x2="10" y2="0" stroke={color} strokeWidth="2" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke={color} strokeWidth="2" />
      </g>
    ),
  },
  drone: {
    label: 'UAV',
    render: (x, y, color, pulse) => (
      <g key={`drone-${x}-${y}`} transform={`translate(${x}, ${y})`}>
        {pulse && (
          <circle r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="12;22;12" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        <polygon points="0,-12 9,8 0,4 -9,8" fill={color} stroke="#0a0d0f" strokeWidth="1" />
      </g>
    ),
  },
  field_operator: {
    label: 'OPE',
    render: (x, y, color, pulse) => (
      <g key={`op-${x}-${y}`} transform={`translate(${x}, ${y})`}>
        {pulse && (
          <circle r="16" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="10;20;10" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r="9" fill={color} stroke="#0a0d0f" strokeWidth="1.5" />
        <circle r="3" fill="#0a0d0f" />
      </g>
    ),
  },
  rf_sensor: {
    label: 'RF',
    render: (x, y, color, pulse) => (
      <g key={`rf-${x}-${y}`} transform={`translate(${x}, ${y})`}>
        {pulse && (
          <polygon
            points="0,-20 17,10 -17,10"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.3"
          >
            <animate attributeName="points" values="0,-14 12,7 -12,7;0,-22 19,11 -19,11;0,-14 12,7 -12,7" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
          </polygon>
        )}
        <polygon points="0,-11 9,6 -9,6" fill={color} stroke="#0a0d0f" strokeWidth="1" />
      </g>
    ),
  },
  cyber_sensor: {
    label: 'CYB',
    render: (x, y, color, pulse) => (
      <g key={`cyb-${x}-${y}`} transform={`translate(${x}, ${y})`}>
        {pulse && (
          <rect x="-16" y="-16" width="32" height="32" fill="none" stroke={color} strokeWidth="1" opacity="0.3">
            <animate attributeName="width" values="22;32;22" dur="2s" repeatCount="indefinite" />
            <animate attributeName="height" values="22;32;22" dur="2s" repeatCount="indefinite" />
            <animate attributeName="x" values="-11;-16;-11" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y" values="-11;-16;-11" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
          </rect>
        )}
        <rect x="-9" y="-9" width="18" height="18" fill={color} stroke="#0a0d0f" strokeWidth="1" transform="rotate(45)" />
        <rect x="-4" y="-4" width="8" height="8" fill="#0a0d0f" transform="rotate(45)" />
      </g>
    ),
  },
};

function getAssetColor(status) {
  switch (status) {
    case 'ACTIVE': return '#00ff41';
    case 'DEGRADED': return '#ffd700';
    case 'INACTIVE': return '#ff3b3b';
    case 'ALERT': return '#ff6b35';
    default: return '#94a3b8';
  }
}

function GridLines({ width, height, latMin, latMax, lonMin, lonMax }) {
  const latLines = [];
  const lonLines = [];
  const latStep = 0.2;
  const lonStep = 0.2;

  for (let lat = Math.ceil(latMin / latStep) * latStep; lat <= latMax; lat += latStep) {
    const y = latToY(lat);
    const label = lat.toFixed(1) + 'N';
    latLines.push(
      <g key={`lat-${lat}`}>
        <line x1={0} y1={y} x2={width} y2={y} stroke="rgba(0,255,65,0.08)" strokeWidth="1" />
        <text x="4" y={y - 3} fontSize="9" fill="rgba(0,255,65,0.4)" fontFamily="Courier New">
          {label}
        </text>
      </g>
    );
  }

  for (let lon = Math.ceil(lonMin / lonStep) * lonStep; lon <= lonMax; lon += lonStep) {
    const x = lonToX(lon);
    const label = Math.abs(lon).toFixed(1) + (lon < 0 ? 'W' : 'E');
    lonLines.push(
      <g key={`lon-${lon}`}>
        <line x1={x} y1={0} x2={x} y2={height} stroke="rgba(0,255,65,0.08)" strokeWidth="1" />
        <text x={x + 3} y={height - 4} fontSize="9" fill="rgba(0,255,65,0.4)" fontFamily="Courier New">
          {label}
        </text>
      </g>
    );
  }

  return (
    <g>
      {latLines}
      {lonLines}
    </g>
  );
}

export default function TacticalMap({ assets, selectedAsset, onAssetClick, liveMode }) {
  const { width, height } = MAP_CONFIG;

  const renderedAssets = useMemo(() => {
    return assets.map((asset) => {
      const x = lonToX(asset.lon);
      const y = latToY(asset.lat);
      const color = getAssetColor(asset.status);
      const isSelected = selectedAsset?.id === asset.id;
      const pulse = asset.status === 'ACTIVE' || asset.status === 'ALERT';
      const iconDef = ASSET_ICONS[asset.kind] || ASSET_ICONS['field_operator'];

      return (
        <g
          key={asset.id}
          onClick={() => onAssetClick && onAssetClick(asset)}
          style={{ cursor: 'pointer' }}
        >
          {isSelected && (
            <circle
              cx={x}
              cy={y}
              r="22"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              strokeDasharray="4,3"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${x} ${y}`}
                to={`360 ${x} ${y}`}
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          <g transform={`translate(${x}, ${y})`}>
            {iconDef.render(0, 0, isSelected ? '#ffffff' : color, pulse)}
          </g>
          <text
            x={x + 14}
            y={y - 8}
            fontSize="10"
            fill={isSelected ? '#ffffff' : color}
            fontFamily="Courier New"
            fontWeight="bold"
          >
            {asset.id}
          </text>
          <text
            x={x + 14}
            y={y + 4}
            fontSize="9"
            fill="rgba(0,255,65,0.6)"
            fontFamily="Courier New"
          >
            {iconDef.label} | {asset.status}
          </text>
        </g>
      );
    });
  }, [assets, selectedAsset, onAssetClick]);

  // Líneas de correlación entre activos ACTIVE cercanos
  const correlationLines = useMemo(() => {
    const activeAssets = assets.filter((a) => a.status === 'ACTIVE');
    const lines = [];
    for (let i = 0; i < activeAssets.length; i++) {
      for (let j = i + 1; j < activeAssets.length; j++) {
        const a = activeAssets[i];
        const b = activeAssets[j];
        const dist = Math.hypot(a.lat - b.lat, a.lon - b.lon);
        if (dist < 0.5) {
          lines.push(
            <line
              key={`corr-${a.id}-${b.id}`}
              x1={lonToX(a.lon)}
              y1={latToY(a.lat)}
              x2={lonToX(b.lon)}
              y2={latToY(b.lat)}
              stroke="rgba(0,255,65,0.15)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        }
      }
    }
    return lines;
  }, [assets]);

  return (
    <div className="tactical-map-wrapper">
      <div className="map-toolbar">
        <div className="map-toolbar-left">
          <span className="map-label">MAPA TACTICO</span>
          <span className="map-coords">39.8N–41.0N / 4.2W–3.0W</span>
        </div>
        <div className="map-toolbar-right">
          <span className={`live-badge ${liveMode ? 'live-on' : 'live-off'}`}>
            {liveMode ? (
              <>
                <span className="live-dot" />
                EN VIVO
              </>
            ) : (
              'REPLAY'
            )}
          </span>
          <span className="map-label">OVERLAY: ACTIVO</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Fondo */}
        <rect width={width} height={height} fill="#050709" />

        {/* Radar sweep */}
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,255,65,0.05)" />
            <stop offset="100%" stopColor="rgba(0,255,65,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid táctico */}
        <GridLines
          width={width}
          height={height}
          latMin={MAP_CONFIG.latMin}
          latMax={MAP_CONFIG.latMax}
          lonMin={MAP_CONFIG.lonMin}
          lonMax={MAP_CONFIG.lonMax}
        />

        {/* Borde del área de operaciones */}
        <rect
          x={lonToX(-3.9)}
          y={latToY(40.7)}
          width={lonToX(-3.2) - lonToX(-3.9)}
          height={latToY(40.1) - latToY(40.7)}
          fill="rgba(255,107,53,0.05)"
          stroke="rgba(255,107,53,0.4)"
          strokeWidth="1.5"
          strokeDasharray="8,4"
        />
        <text
          x={lonToX(-3.9) + 4}
          y={latToY(40.7) + 14}
          fontSize="10"
          fill="rgba(255,107,53,0.7)"
          fontFamily="Courier New"
        >
          ZONA DE INTERES [ALFA]
        </text>

        {/* Líneas de correlación */}
        {correlationLines}

        {/* Activos */}
        <g filter="url(#glow)">{renderedAssets}</g>
      </svg>

      {/* Leyenda */}
      <div className="map-legend">
        <span className="legend-title">LEYENDA</span>
        <div className="legend-items">
          <span className="legend-item">
            <svg width="14" height="14" viewBox="-7 -7 14 14">
              <polygon points="0,-6 5,3 -5,3" fill="#00ff41" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#00ff41" strokeWidth="1.5" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#00ff41" strokeWidth="1.5" />
            </svg>
            SAT
          </span>
          <span className="legend-item">
            <svg width="14" height="14" viewBox="-7 -7 14 14">
              <polygon points="0,-6 5,4 0,2 -5,4" fill="#00ff41" />
            </svg>
            UAV
          </span>
          <span className="legend-item">
            <svg width="14" height="14" viewBox="-7 -7 14 14">
              <circle r="5" fill="#00ff41" />
              <circle r="2" fill="#050709" />
            </svg>
            OPERADOR
          </span>
          <span className="legend-item">
            <svg width="14" height="14" viewBox="-7 -7 14 14">
              <polygon points="0,-6 5,3 -5,3" fill="#00ff41" />
            </svg>
            RF
          </span>
          <span className="legend-item">
            <svg width="14" height="14" viewBox="-7 -7 14 14">
              <rect x="-5" y="-5" width="10" height="10" fill="#00ff41" transform="rotate(45)" />
              <rect x="-2" y="-2" width="4" height="4" fill="#050709" transform="rotate(45)" />
            </svg>
            CYBER
          </span>
        </div>
        <div className="legend-status">
          <span className="legend-status-dot" style={{ background: '#00ff41' }} /> ACTIVO
          <span className="legend-status-dot" style={{ background: '#ffd700', marginLeft: 8 }} /> DEGRADADO
          <span className="legend-status-dot" style={{ background: '#ff3b3b', marginLeft: 8 }} /> INACTIVO
        </div>
      </div>
    </div>
  );
}
