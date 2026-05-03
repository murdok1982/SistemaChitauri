import { useState, useEffect } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import { Clock, Wifi, WifiOff, Activity, Shield, AlertTriangle } from 'lucide-react'

export function Header({ wsConnected, liveMode, onToggleLiveMode }: {
  wsConnected: boolean
  liveMode: boolean
  onToggleLiveMode: () => void
}) {
  const [utcTime, setUtcTime] = useState(new Date())
  const { threatLevel, aresStatus } = useSesisStore()

  useEffect(() => {
    const timer = setInterval(() => setUtcTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const threatColors = {
    'BAJO': 'bg-green-500',
    'MODERADO': 'bg-yellow-500',
    'ELEVADO': 'bg-orange-500',
    'ALTO': 'bg-red-500',
    'CRITICO': 'bg-red-700 animate-pulse',
  }

  return (
    <header className="h-14 bg-military-panel border-b border-military-border flex items-center px-4 justify-between z-10">
      {/* Left: System Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-military-green" />
          <span className="font-mono font-bold text-sm">SESIS</span>
          <span className="text-xs text-gray-400">v3.0</span>
        </div>

        <div className="h-6 w-px bg-military-border" />

        <div className="flex items-center gap-2 text-xs font-mono">
          <Clock className="w-3 h-3" />
          <span>
            {utcTime.toISOString().replace('T', ' ').substring(0, 19)} UTC
          </span>
        </div>

        <div className="h-6 w-px bg-military-border" />

        <div className="flex items-center gap-2 text-xs">
          <Activity className={`w-3 h-3 ${aresStatus === 'ONLINE' ? 'text-green-500' : 'text-red-500'}`} />
          <span className="font-mono">ARES: {aresStatus}</span>
        </div>
      </div>

      {/* Center: Threat Level */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <span className="text-xs text-gray-400">AMENAZA:</span>
        <div className={`px-3 py-1 rounded text-xs font-bold font-mono ${threatColors[threatLevel.level] || 'bg-gray-500'}`}>
          {threatLevel.level}
        </div>
      </div>

      {/* Right: Status & Controls */}
      <div className="flex items-center gap-4">
        {/* Live Mode Toggle */}
        <button
          onClick={onToggleLiveMode}
          className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors ${
            liveMode
              ? 'bg-military-green/20 text-military-green border border-military-green/50'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-military-green animate-pulse' : 'bg-gray-500'}`} />
          LIVE
        </button>

        {/* WebSocket Status */}
        <div className="flex items-center gap-1 text-xs font-mono">
          {wsConnected ? (
            <Wifi className="w-3 h-3 text-green-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-500" />
          )}
          <span className={wsConnected ? 'text-green-500' : 'text-red-500'}>
            {wsConnected ? 'CONECTADO' : 'DESCONECTADO'}
          </span>
        </div>

        {/* Classification */}
        <div className="px-3 py-1 rounded text-xs font-mono bg-red-900/50 text-red-300 border border-red-700">
          SECRETO
        </div>
      </div>
    </header>
  )
}
