import { useState, useEffect, useCallback, useRef } from 'react';
import TacticalMap from './components/TacticalMap.jsx';
import AssetList from './components/AssetList.jsx';
import IntelPanel from './components/IntelPanel.jsx';
import AresChat from './components/AresChat.jsx';
import AlertTicker from './components/AlertTicker.jsx';

const API_BASE = window.SESIS_API_URL || 'http://localhost:8000';
const POLL_INTERVAL_MS = 10000;

// ---------------------------------------------------------------------------
// Datos mock — se usan cuando el backend no responde
// ---------------------------------------------------------------------------
const MOCK_ASSETS = [
  { id: 'SAT-KH-01', kind: 'satellite', status: 'ACTIVE', lat: 40.4, lon: -3.7, classification: 'SECRET' },
  { id: 'DRONE-TAC-05', kind: 'drone', status: 'ACTIVE', lat: 40.2, lon: -3.5, classification: 'CONFIDENTIAL' },
  { id: 'OPE-CAMPO-12', kind: 'field_operator', status: 'ACTIVE', lat: 40.5, lon: -3.8, classification: 'RESTRICTED' },
  { id: 'RF-SENSOR-07', kind: 'rf_sensor', status: 'DEGRADED', lat: 40.3, lon: -3.6, classification: 'SECRET' },
  { id: 'CYBER-NODE-01', kind: 'cyber_sensor', status: 'ACTIVE', lat: 40.45, lon: -3.72, classification: 'TOP_SECRET' },
];

const MOCK_ALERTS = [
  {
    id: '001',
    severity: 'HIGH',
    type: 'RF_ANOMALY',
    message: 'Anomalia RF detectada en sector Bravo-7. Frequency hopping confirmado.',
    asset_id: 'RF-SENSOR-07',
    timestamp: new Date().toISOString(),
  },
  {
    id: '002',
    severity: 'CRITICAL',
    type: 'CV_MATCH',
    message: 'Cambio de patron detectado en imagen SAT-KH-01. Confidence 0.97.',
    asset_id: 'SAT-KH-01',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: '003',
    severity: 'MEDIUM',
    type: 'GEO_FENCE',
    message: 'DRONE-TAC-05 aproximandose a zona restringida Alfa-3.',
    asset_id: 'DRONE-TAC-05',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

const MOCK_PIRS = [
  { id: 'PIR-01', description: 'Actividad de RF no identificada en frecuencias militares sector NE', priority: 'HIGH' },
  { id: 'PIR-02', description: 'Movimientos de vehiculos en perimetro zona de exclusion', priority: 'CRITICAL' },
  { id: 'PIR-03', description: 'Estado de activos satelitales en orbita baja sobre AO', priority: 'MEDIUM' },
];

const MOCK_REPORTS = [
  { id: 'R001', type: 'IMINT', summary: 'Imagenes SAT-KH-01: actividad en cuadricula 447. 3 vehiculos identificados.', timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 'R002', type: 'SIGINT', summary: 'Intercepcion en banda 438MHz. Trafico cifrado no resuelto.', timestamp: new Date(Date.now() - 180000).toISOString() },
  { id: 'R003', type: 'HUMINT', summary: 'Fuente SIERRA-4 confirma reunion en punto de contacto delta.', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'R004', type: 'CYBER', summary: 'Intento de acceso no autorizado a CYBER-NODE-01. Bloqueado.', timestamp: new Date(Date.now() - 900000).toISOString() },
];

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
const CLASSIFICATION_LEVELS = [
  { id: 'OPEN', label: 'ABIERTO', color: '#00ff41' },
  { id: 'RESTRICTED', label: 'RESTRINGIDO', color: '#ffd700' },
  { id: 'CONFIDENTIAL', label: 'CONFIDENCIAL', color: '#ff8c00' },
  { id: 'SECRET', label: 'SECRETO', color: '#ff0000' },
];

function UtcClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const hh = pad(time.getUTCHours());
  const mm = pad(time.getUTCMinutes());
  const ss = pad(time.getUTCSeconds());
  const dateStr = time.toISOString().split('T')[0];

  return (
    <div className="utc-clock" aria-label="Reloj UTC">
      <span className="clock-label">UTC</span>
      <span className="clock-time">{hh}:{mm}:{ss}</span>
      <span className="clock-date">{dateStr}</span>
    </div>
  );
}

function Header({ systemStatus, aresStatus, sensorCount, classification }) {
  const classInfo = CLASSIFICATION_LEVELS.find((c) => c.id === classification) || CLASSIFICATION_LEVELS[0];

  return (
    <header className="sesis-header" role="banner">
      <div className="header-left">
        <div className="sesis-logo">
          <span className="logo-sesis">SESIS</span>
          <div className="logo-subtitle">
            <span>SISTEMA DE EXPLORACION, SUPERVISION E INTELIGENCIA DE SEGURIDAD</span>
            <span className="logo-version">v2.0 | SOBERANO UE</span>
          </div>
        </div>
        <div
          className="classification-badge"
          style={{ background: `${classInfo.color}22`, borderColor: classInfo.color, color: classInfo.color }}
          aria-label={`Nivel de clasificacion: ${classInfo.label}`}
        >
          {classInfo.label}
        </div>
      </div>

      <div className="header-center">
        <UtcClock />
      </div>

      <div className="header-right">
        <div className="status-indicators">
          <div className="status-indicator">
            <span className="status-ind-label">SISTEMA</span>
            <span
              className={`status-ind-value ${systemStatus === 'OPERATIVO' ? 'status-green' : systemStatus === 'DEGRADADO' ? 'status-yellow' : 'status-red'}`}
            >
              {systemStatus}
            </span>
          </div>
          <div className="status-indicator">
            <span className="status-ind-label">ARES</span>
            <span
              className={`status-ind-value ${aresStatus === 'ONLINE' ? 'status-green' : aresStatus === 'OFFLINE' ? 'status-red' : 'status-yellow'}`}
            >
              {aresStatus}
            </span>
          </div>
          <div className="status-indicator">
            <span className="status-ind-label">SENSORES</span>
            <span className="status-ind-value status-green">{sensorCount} ACTIVOS</span>
          </div>
        </div>
        <div className="header-scanline" aria-hidden="true" />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------
async function apiFetch(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Dashboard principal
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [threatLevel, setThreatLevel] = useState('ELEVADO');
  const [aresStatus, setAresStatus] = useState('CHECKING');
  const [intelProducts, setIntelProducts] = useState({
    intsum: null,
    pirs: MOCK_PIRS,
    reports: MOCK_REPORTS,
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [events, setEvents] = useState([...MOCK_ALERTS]);
  const [liveMode, setLiveMode] = useState(true);
  const [systemStatus] = useState('OPERATIVO');
  const [classification] = useState('SECRET');
  const pollRef = useRef(null);

  // Fetch desde API (con fallback a mock)
  const fetchAll = useCallback(async () => {
    const [assetsData, alertsData, intelData, pirData, aresData] = await Promise.all([
      apiFetch('/v1/assets/', MOCK_ASSETS),
      apiFetch('/v1/alerts/?severity=HIGH&limit=20', MOCK_ALERTS),
      apiFetch('/v1/intel/products', null),
      apiFetch('/v1/intel/pir', MOCK_PIRS),
      apiFetch('/v1/brain/status', null),
    ]);

    setAssets(Array.isArray(assetsData) ? assetsData : MOCK_ASSETS);
    setAlerts(Array.isArray(alertsData) ? alertsData : MOCK_ALERTS);

    if (pirData) {
      setIntelProducts((prev) => ({
        ...prev,
        pirs: Array.isArray(pirData) ? pirData : MOCK_PIRS,
        intsum: intelData || prev.intsum,
      }));
    }

    if (aresData) {
      setAresStatus(aresData.status === 'online' ? 'ONLINE' : 'OFFLINE');
      if (aresData.threat_level) setThreatLevel(aresData.threat_level);
    } else {
      // Si no hay respuesta del backend, asumimos modo demo
      setAresStatus((prev) => (prev === 'CHECKING' ? 'OFFLINE' : prev));
    }

    // Actualizar events ticker con alertas nuevas
    setEvents((prev) => {
      const newAlerts = Array.isArray(alertsData) ? alertsData : MOCK_ALERTS;
      const merged = [...newAlerts, ...prev].slice(0, 50);
      return merged;
    });
  }, []);

  useEffect(() => {
    fetchAll();
    if (liveMode) {
      pollRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);
    }
    return () => clearInterval(pollRef.current);
  }, [fetchAll, liveMode]);

  const handleAssetClick = useCallback((asset) => {
    setSelectedAsset((prev) => (prev?.id === asset.id ? null : asset));
  }, []);

  const handleGenerateBriefing = useCallback(() => {
    // Activa el chat y dispara el modo briefing
    // El componente AresChat escucha via prop si fuera necesario
    // Por ahora scrolleamos al chat
    document.querySelector('.ares-chat-panel')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleLiveMode = useCallback(() => {
    setLiveMode((prev) => {
      if (!prev) {
        pollRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);
      } else {
        clearInterval(pollRef.current);
      }
      return !prev;
    });
  }, [fetchAll]);

  const activeSensorCount = assets.filter((a) => a.status === 'ACTIVE').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');

  return (
    <div className="command-center" role="main">
      <Header
        systemStatus={systemStatus}
        aresStatus={aresStatus}
        sensorCount={activeSensorCount}
        classification={classification}
      />

      {/* Banda de alerta critica */}
      {criticalAlerts.length > 0 && (
        <div className="critical-alert-band" role="alert" aria-live="assertive">
          <span className="critical-band-icon">!</span>
          <span className="critical-band-text">
            ALERTA CRITICA ACTIVA: {criticalAlerts[0].message}
          </span>
          <span className="critical-band-count">{criticalAlerts.length} CRITICA(S)</span>
        </div>
      )}

      {/* Layout principal 3 columnas */}
      <div className="command-grid">
        {/* Columna izquierda */}
        <aside className="col-left panel" aria-label="Panel de activos">
          <AssetList
            assets={assets}
            alerts={alerts}
            selectedAsset={selectedAsset}
            onAssetClick={handleAssetClick}
          />
        </aside>

        {/* Columna central: mapa */}
        <section className="col-center panel" aria-label="Mapa tactico">
          <div className="map-live-toggle">
            <button
              className={`live-toggle-btn ${liveMode ? 'live-on' : 'live-off'}`}
              onClick={toggleLiveMode}
              aria-label={liveMode ? 'Cambiar a modo replay' : 'Activar modo en vivo'}
            >
              {liveMode ? 'EN VIVO' : 'REPLAY'}
            </button>
            <span className="map-asset-summary">
              {assets.length} ACTIVOS | {alerts.length} ALERTAS
            </span>
          </div>
          <TacticalMap
            assets={assets}
            selectedAsset={selectedAsset}
            onAssetClick={handleAssetClick}
            liveMode={liveMode}
          />
        </section>

        {/* Columna derecha: intel */}
        <aside className="col-right panel" aria-label="Panel de inteligencia">
          <IntelPanel
            threatLevel={threatLevel}
            intsum={intelProducts.intsum}
            pirs={intelProducts.pirs}
            reports={intelProducts.reports}
            onGenerateBriefing={handleGenerateBriefing}
          />
        </aside>
      </div>

      {/* Panel de chat con ARES */}
      <section className="chat-section panel" aria-label="Chat con ARES">
        <AresChat
          alerts={alerts}
          assets={assets}
          aresStatus={aresStatus}
          onAresStatusChange={setAresStatus}
        />
      </section>

      {/* Footer ticker */}
      <footer className="command-footer" role="contentinfo">
        <AlertTicker events={events} />
      </footer>
    </div>
  );
}
