import React, { useState } from 'react';

const KIND_LABELS = {
  satellite: 'SATELITE',
  drone: 'UAV/DRONE',
  field_operator: 'OPERADOR',
  rf_sensor: 'SENSOR RF',
  cyber_sensor: 'CYBER NODE',
};

const KIND_ICONS = {
  satellite: '◆',
  drone: '▲',
  field_operator: '●',
  rf_sensor: '▴',
  cyber_sensor: '■',
};

const STATUS_COLORS = {
  ACTIVE: '#00ff41',
  DEGRADED: '#ffd700',
  INACTIVE: '#ff3b3b',
  ALERT: '#ff6b35',
};

const CLASSIFICATION_COLORS = {
  OPEN: '#00ff41',
  UNCLASSIFIED: '#00ff41',
  RESTRICTED: '#ffd700',
  CONFIDENTIAL: '#ff8c00',
  SECRET: '#ff0000',
  TOP_SECRET: '#9400d3',
};

const ALL_KINDS = ['all', 'satellite', 'drone', 'field_operator', 'rf_sensor', 'cyber_sensor'];

function AlertCounter({ alerts }) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  alerts.forEach((a) => {
    if (counts[a.severity] !== undefined) counts[a.severity]++;
  });

  const colors = {
    CRITICAL: '#ff0000',
    HIGH: '#ff6b35',
    MEDIUM: '#ffd700',
    LOW: '#00ff41',
  };

  return (
    <div className="alert-counter-row">
      {Object.entries(counts).map(([sev, count]) => (
        <div
          key={sev}
          className="alert-counter-badge"
          style={{ borderColor: colors[sev], color: colors[sev] }}
        >
          <span className="alert-counter-num">{count}</span>
          <span className="alert-counter-label">{sev}</span>
        </div>
      ))}
    </div>
  );
}

export default function AssetList({ assets, alerts, selectedAsset, onAssetClick }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = assets.filter((a) => {
    const kindMatch = activeFilter === 'all' || a.kind === activeFilter;
    const searchMatch =
      searchTerm === '' ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    return kindMatch && searchMatch;
  });

  return (
    <div className="asset-list-panel">
      <div className="panel-header">
        <span className="panel-title">CONTROL DE ACTIVOS</span>
        <span className="asset-count">{assets.length} UNIDADES</span>
      </div>

      <AlertCounter alerts={alerts} />

      <div className="asset-search">
        <input
          type="text"
          placeholder="BUSCAR ID DE ACTIVO..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="asset-search-input"
          aria-label="Buscar activo por ID"
        />
      </div>

      <div className="asset-filter-row">
        {ALL_KINDS.map((kind) => (
          <button
            key={kind}
            className={`filter-btn ${activeFilter === kind ? 'filter-active' : ''}`}
            onClick={() => setActiveFilter(kind)}
            title={kind === 'all' ? 'Todos' : KIND_LABELS[kind]}
          >
            {kind === 'all' ? 'TODOS' : KIND_ICONS[kind]}
          </button>
        ))}
      </div>

      <div className="asset-scroll">
        {filtered.length === 0 && (
          <div className="asset-empty">SIN ACTIVOS EN FILTRO ACTUAL</div>
        )}
        {filtered.map((asset) => {
          const isSelected = selectedAsset?.id === asset.id;
          const statusColor = STATUS_COLORS[asset.status] || '#94a3b8';
          const classColor = CLASSIFICATION_COLORS[asset.classification] || '#94a3b8';
          const assetAlerts = alerts.filter((al) => al.asset_id === asset.id);
          const hasAlert = assetAlerts.length > 0;

          return (
            <div
              key={asset.id}
              className={`asset-item ${isSelected ? 'asset-selected' : ''} ${hasAlert ? 'asset-has-alert' : ''}`}
              onClick={() => onAssetClick && onAssetClick(asset)}
              role="button"
              tabIndex={0}
              aria-label={`Activo ${asset.id}, estado ${asset.status}`}
              onKeyDown={(e) => e.key === 'Enter' && onAssetClick && onAssetClick(asset)}
            >
              <div className="asset-item-top">
                <span className="asset-kind-icon" style={{ color: statusColor }}>
                  {KIND_ICONS[asset.kind] || '?'}
                </span>
                <div className="asset-id-block">
                  <span className="asset-id">{asset.id}</span>
                  <span className="asset-kind-label">{KIND_LABELS[asset.kind] || asset.kind}</span>
                </div>
                <div className="asset-status-block">
                  <span
                    className="asset-status-dot"
                    style={{ background: statusColor }}
                    title={asset.status}
                  />
                  {hasAlert && (
                    <span className="asset-alert-indicator">!</span>
                  )}
                </div>
              </div>
              <div className="asset-item-bottom">
                <span className="asset-coords">
                  {asset.lat.toFixed(3)}N / {Math.abs(asset.lon).toFixed(3)}W
                </span>
                <span
                  className="asset-classification"
                  style={{ color: classColor, borderColor: classColor }}
                >
                  {asset.classification}
                </span>
              </div>
              {hasAlert && (
                <div className="asset-alert-bar">
                  {assetAlerts[0].message}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedAsset && (
        <div className="asset-detail-card">
          <div className="asset-detail-header">
            <span>TELEMETRIA: {selectedAsset.id}</span>
            <span
              className="asset-detail-status"
              style={{ color: STATUS_COLORS[selectedAsset.status] }}
            >
              {selectedAsset.status}
            </span>
          </div>
          <div className="asset-detail-rows">
            <div className="asset-detail-row">
              <span>TIPO</span>
              <span>{KIND_LABELS[selectedAsset.kind] || selectedAsset.kind}</span>
            </div>
            <div className="asset-detail-row">
              <span>LAT</span>
              <span>{selectedAsset.lat.toFixed(5)}N</span>
            </div>
            <div className="asset-detail-row">
              <span>LON</span>
              <span>{Math.abs(selectedAsset.lon).toFixed(5)}W</span>
            </div>
            <div className="asset-detail-row">
              <span>CLASIFICACION</span>
              <span style={{ color: CLASSIFICATION_COLORS[selectedAsset.classification] }}>
                {selectedAsset.classification}
              </span>
            </div>
            {selectedAsset.battery !== undefined && (
              <div className="asset-detail-row">
                <span>BATERIA</span>
                <span>{selectedAsset.battery}%</span>
              </div>
            )}
            {selectedAsset.signal !== undefined && (
              <div className="asset-detail-row">
                <span>SENAL RF</span>
                <span>{selectedAsset.signal}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
