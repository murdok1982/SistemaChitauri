import { useState } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import { Map, NavigationControl, Marker } from 'react-map-gl'
import { MapPin } from 'lucide-react'
import type { Asset } from '@/types/sesis'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

type Affiliation = 'friend' | 'hostile' | 'neutral' | 'unknown'

function getAffiliation(asset: Asset): Affiliation {
  const raw = asset.metadata?.affiliation
  if (raw === 'hostile' || raw === 'neutral' || raw === 'unknown' || raw === 'friend') {
    return raw
  }
  return 'friend'
}

/**
 * APP-6 mínimo (afiliación por forma+color, WCAG operativo).
 * No es el set completo APP-6D — solo afiliación.
 */
function AffiliationSymbol({ affiliation, size = 18 }: { affiliation: Affiliation; size?: number }) {
  const stroke = {
    friend: '#00ffff',
    hostile: '#ff0000',
    neutral: '#00ff00',
    unknown: '#ffff00',
  }[affiliation]
  const fill = `${stroke}33` // semitransparente
  const half = size / 2

  if (affiliation === 'hostile') {
    // Rombo (rotado 45°)
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <rect
          x={half - half * 0.7}
          y={half - half * 0.7}
          width={size * 0.7}
          height={size * 0.7}
          transform={`rotate(45 ${half} ${half})`}
          stroke={stroke}
          strokeWidth={2}
          fill={fill}
        />
      </svg>
    )
  }
  if (affiliation === 'unknown') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <rect x={2} y={2} width={size - 4} height={size - 4} stroke={stroke} strokeWidth={2} fill={fill} />
        <text x={half} y={half + 4} textAnchor="middle" fontSize={size * 0.7} fill={stroke} fontFamily="monospace" fontWeight="bold">?</text>
      </svg>
    )
  }
  if (affiliation === 'friend') {
    // Rectángulo cyan
    return (
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`} aria-hidden="true">
        <rect x={2} y={2} width={size - 4} height={size * 0.75 - 4} stroke={stroke} strokeWidth={2} fill={fill} />
      </svg>
    )
  }
  // neutral: cuadrado verde
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <rect x={2} y={2} width={size - 4} height={size - 4} stroke={stroke} strokeWidth={2} fill={fill} />
    </svg>
  )
}

export function TacticalMap({ fullscreen = false }: { fullscreen?: boolean }) {
  const { assets, selectedAssetId, selectAsset } = useSesisStore()
  const [mapCenter] = useState<[number, number]>([40.4, -3.7])
  const [zoom] = useState(8)

  const getAssetIcon = (kind: string) => {
    switch (kind) {
      case 'satellite': return '🛰️'
      case 'drone': return '🚁'
      case 'field_operator': return '💂'
      case 'rf_sensor': return '📡'
      case 'cyber_sensor': return '💻'
      default: return '📍'
    }
  }

  const getAffiliationStroke = (affiliation: Affiliation): string => ({
    friend: '#00ffff',
    hostile: '#ff0000',
    neutral: '#00ff00',
    unknown: '#ffff00',
  }[affiliation])

  const getClassificationColor = (level: string) => {
    switch (level) {
      case 'TOP_SECRET': return '#9400d3'
      case 'SECRET': return '#ff0000'
      case 'CONFIDENTIAL': return '#ff6b35'
      case 'RESTRICTED': return '#ffd700'
      default: return '#00ff41'
    }
  }

  return (
    <div className={`relative ${fullscreen ? 'h-screen' : 'h-full'} bg-military-panel rounded border border-military-border overflow-hidden`}>
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-military-panel/90 backdrop-blur p-2 flex items-center justify-between border-b border-military-border">
        <div className="flex items-center gap-2 text-xs font-mono">
          <MapPin className="w-3 h-3 text-military-green" />
          <span>MAPA TÁCTICO — SECTOR ALFA</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            BLUE FORCE: {assets.filter(a => a.current_status === 'ACTIVE').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            RED FORCE: 0
          </span>
        </div>
      </div>

      {/* Mapbox Map */}
      {MAPBOX_TOKEN ? (
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: mapCenter[1],
            latitude: mapCenter[0],
            zoom: zoom,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        >
          <NavigationControl position="top-right" />

          {assets.map((asset) => {
            const affiliation = getAffiliation(asset)
            return (
              <Marker
                key={asset.id}
                longitude={asset.location[1]}
                latitude={asset.location[0]}
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  selectAsset(asset.id)
                }}
              >
                <div
                  className={`cursor-pointer transform hover:scale-125 transition-transform relative ${
                    selectedAssetId === asset.id ? 'scale-125' : ''
                  }`}
                  title={`${asset.id} - ${asset.kind} (${affiliation})`}
                  aria-label={`Activo ${asset.id}, ${asset.kind}, afiliación ${affiliation}`}
                >
                  <AffiliationSymbol affiliation={affiliation} size={22} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] pointer-events-none">
                    {getAssetIcon(asset.kind)}
                  </span>
                  <div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white"
                    style={{ backgroundColor: getClassificationColor(asset.classification_level) }}
                  />
                </div>
              </Marker>
            )
          })}
        </Map>
      ) : (
        /* Fallback SVG Map */
        <div className="w-full h-full bg-military-dark flex items-center justify-center">
          <svg viewBox="0 0 400 300" className="w-full h-full opacity-50">
            {/* Grid */}
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 30} x2="400" y2={i * 30} stroke="#2a3f5a" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="300" stroke="#2a3f5a" strokeWidth="0.5" />
            ))}

            {/* Assets — APP-6 mínimo (afiliación por forma+color) */}
            {assets.map((asset, idx) => {
              const x = 50 + (idx * 60) % 300
              const y = 50 + (idx * 40) % 200
              const affiliation = getAffiliation(asset)
              const stroke = getAffiliationStroke(affiliation)
              const fillSemi = `${stroke}33`
              return (
                <g key={asset.id}>
                  {affiliation === 'hostile' ? (
                    <rect
                      x={x - 7}
                      y={y - 7}
                      width="14"
                      height="14"
                      transform={`rotate(45 ${x} ${y})`}
                      stroke={stroke}
                      strokeWidth="2"
                      fill={fillSemi}
                    />
                  ) : affiliation === 'friend' ? (
                    <rect x={x - 9} y={y - 6} width="18" height="12" stroke={stroke} strokeWidth="2" fill={fillSemi} />
                  ) : affiliation === 'neutral' ? (
                    <rect x={x - 7} y={y - 7} width="14" height="14" stroke={stroke} strokeWidth="2" fill={fillSemi} />
                  ) : (
                    <g>
                      <rect x={x - 7} y={y - 7} width="14" height="14" stroke={stroke} strokeWidth="2" fill={fillSemi} />
                      <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={stroke} fontWeight="bold">?</text>
                    </g>
                  )}
                  <text x={x} y={y + 22} fill={stroke} fontSize="8" textAnchor="middle">
                    {asset.id.substring(0, 6)}
                  </text>
                </g>
              )
            })}

            {/* Zone Alfa */}
            <rect x="100" y="80" width="200" height="140" fill="none" stroke="#ff6b35" strokeWidth="2" strokeDasharray="5,5" />
            <text x="200" y="75" fill="#ff6b35" fontSize="10" textAnchor="middle">ZONA ALFA</text>
          </svg>
        </div>
      )}

      {/* Selected Asset Info */}
      {selectedAssetId && (
        <div className="absolute bottom-4 left-4 bg-military-panel/95 backdrop-blur p-3 rounded border border-military-border max-w-xs">
          {(() => {
            const asset = assets.find(a => a.id === selectedAssetId)
            if (!asset) return null
            return (
              <>
                <div className="text-xs font-bold font-mono text-military-green">{asset.id}</div>
                <div className="text-xs text-gray-400">{asset.kind} • {asset.current_status}</div>
                <div className="text-xs text-gray-500 mt-1">
                  📍 {asset.location[0].toFixed(4)}, {asset.location[1].toFixed(4)}
                </div>
                <div className="text-[10px] mt-1">
                  <span className={`px-1.5 py-0.5 rounded ${
                    asset.classification_level === 'SECRET' ? 'bg-red-900/50 text-red-300' :
                    asset.classification_level === 'CONFIDENTIAL' ? 'bg-orange-900/50 text-orange-300' :
                    'bg-green-900/50 text-green-300'
                  }`}>
                    {asset.classification_level}
                  </span>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
