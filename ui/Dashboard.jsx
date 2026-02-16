import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [assets, setAssets] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);

    useEffect(() => {
        // Simulated API fetch
        const mockAssets = [
            { id: 'DRONE_ALPHA_01', kind: 'DRONE', status: 'active', lat: 48.8566, lon: 2.3522, battery: 88 },
            { id: 'VEHICLE_BETA_02', kind: 'VEHICLE', status: 'moving', lat: 48.8580, lon: 2.3530, fuel: 72 },
            { id: 'RF_STATION_03', kind: 'RF_SENSOR', status: 'active', lat: 48.8540, lon: 2.3510, signal: 'Strong' },
        ];
        setAssets(mockAssets);

        const mockAlerts = [
            { id: 1, type: 'RF_ANOMALY', severity: 'HIGH', msg: 'Frequency hopping detected in Sector B', ts: '13:42:01' },
            { id: 2, type: 'CV_MATCH', severity: 'MEDIUM', msg: 'Bbox 0.98 match with Authorized Fleet', ts: '13:40:55' },
            { id: 3, type: 'GEO_FENCE', severity: 'LOW', msg: 'Drone Alpha 01 approaching restricted zone', ts: '13:38:20' },
        ];
        setAlerts(mockAlerts);
    }, []);

    return (
        <div className="dashboard-container">
            <header className="header glass-panel">
                <div className="logo">
                    <h1>SESIS <span style={{ color: '#fff', fontSize: '0.8rem', opacity: 0.7 }}>| Mission Control v1.0 [SOBERANO UE]</span></h1>
                </div>
                <div className="system-status" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>EU-WEST-1 NODE</div>
                        <div style={{ color: '#00ffa3' }}>CONNECTED</div>
                    </div>
                    <span className="status-badge status-active">ALL SYSTEMS NOMINAL</span>
                </div>
            </header>

            <aside className="sidebar glass-panel">
                <h3 style={{ marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Tactical Assets</h3>
                <div className="asset-list" style={{ overflowY: 'auto', flex: 1 }}>
                    {assets.map(asset => (
                        <div
                            key={asset.id}
                            className={`asset-item ${selectedAsset?.id === asset.id ? 'active' : ''}`}
                            onClick={() => setSelectedAsset(asset)}
                            style={{
                                marginBottom: '10px',
                                padding: '12px',
                                background: selectedAsset?.id === asset.id ? 'rgba(0, 163, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                borderLeft: selectedAsset?.id === asset.id ? '3px solid var(--accent-blue)' : '3px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{asset.id}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{asset.status.toUpperCase()}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                Kind: {asset.kind}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedAsset && (
                    <div className="asset-detail" style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent-blue)' }}>Telemetry: {selectedAsset.id}</h4>
                        <div>Lat/Lon: {selectedAsset.lat}, {selectedAsset.lon}</div>
                        {selectedAsset.battery && <div>Battery: {selectedAsset.battery}%</div>}
                        {selectedAsset.fuel && <div>Fuel: {selectedAsset.fuel}%</div>}
                    </div>
                )}
            </aside>

            <main className="map-viewport glass-panel">
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                    <svg width="80%" height="80%" viewBox="0 0 800 500" style={{ opacity: 0.2 }}>
                        <path d="M50,50 L750,50 L750,450 L50,450 Z" stroke="var(--accent-blue)" fill="none" strokeDasharray="5,5" />
                        <circle cx="488" cy="235" r="5" fill="var(--accent-red)" />
                        <circle cx="400" cy="250" r="150" stroke="rgba(0, 163, 255, 0.2)" fill="none" />
                    </svg>
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--glass-border)' }}>
                        <strong>TACTICAL OVERLAY:</strong> ACTIVE<br />
                        <strong>LAYERS:</strong> POSTGIS_EVENTS_v1, SAT_CLIMATE_v2
                    </div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', letterSpacing: '2px', color: '#e2e8f0', textShadow: '0 0 10px rgba(0, 163, 255, 0.5)' }}>
                            [ INTERACTIVE TACTICAL MAP INITIALIZING... ]
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.6 }}>
                            GEO-QUERY: SELECT * FROM events WHERE ST_DWithin(...)
                        </div>
                    </div>
                </div>
            </main>

            <section className="alerts-panel glass-panel">
                <h3 style={{ marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Situational Alerts</h3>
                <div className="alert-list" style={{ overflowY: 'auto', flex: 1 }}>
                    {alerts.map(alert => (
                        <div key={alert.id} className="timeline-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 'bold', color: alert.severity === 'HIGH' ? '#ff3b3b' : '#00a3ff', fontSize: '0.85rem' }}>{alert.type}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{alert.ts}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', margin: '0', color: '#e2e8f0' }}>{alert.msg}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button style={{ background: 'rgba(0, 163, 255, 0.1)', border: '1px solid rgba(0, 163, 255, 0.3)', color: '#00a3ff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>DETAILS</button>
                                <button style={{ background: 'rgba(0, 255, 163, 0.1)', border: '1px solid rgba(0, 255, 163, 0.3)', color: '#00ffa3', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>ACKNOWLEDGE</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                    <button style={{ width: '100%', padding: '10px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        GENERATE OPS BRIEFING
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
