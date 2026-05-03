import { useEffect, useState } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import { Map, NavigationControl, Marker } from 'react-map-gl'
import { Shield, MapPin, Radio, Zap } from 'lucide-react'
import type { Asset } from '@/types/sesis'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

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

  const getClassificationColor = (level: string) => {
    switch (level) {
      case 'TOP_SECRET': return '#ff00ff'
      case 'SECRET': return '#ff0000'
      case 'CONFIDENTIAL': return '#ff6b35'
      case 'RESTRICTED': return '#ffff00'
      default: return '#00ff00'
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

          {assets.map((asset) => (
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
                className={`cursor-pointer transform hover:scale-125 transition-transform ${
                  selectedAssetId === asset.id ? 'scale-125' : ''
                }`}
                title={`${asset.id} - ${asset.kind}`}
              >
                <span className="text-lg">{getAssetIcon(asset.kind)}</span>
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: getClassificationColor(asset.classification_level) }}
                />
              </div>
            </Marker>
          ))}
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

            {/* Assets */}
            {assets.map((asset, idx) => {
              const x = 50 + (idx * 60) % 300
              const y = 50 + (idx * 40) % 200
              return (
                <g key={asset.id}>
                  <circle cx={x} cy={y} r="8" fill="#00ff41" opacity="0.8">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={x} y={y + 20} fill="#00ff41" fontSize="8" textAnchor="middle">
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
