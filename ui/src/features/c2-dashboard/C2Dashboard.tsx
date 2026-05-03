import { useState, useEffect } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import { Activity, BarChart3, AlertTriangle, Shield, Radio, Zap, Truck } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Mission, BlueForceUnit } from '@/types/sesis'

export function C2Dashboard({ fullscreen = false }: { fullscreen?: boolean }) {
  const { assets, alerts, threatLevel, missions, blueForceUnits } = useSesisStore()
  const [stats, setStats] = useState({
    activeAssets: 0,
    alerts24h: 0,
    missionsActive: 0,
    blueForceCount: 0,
  })

  useEffect(() => {
    setStats({
      activeAssets: assets.filter(a => a.current_status === 'ACTIVE').length,
      alerts24h: alerts.filter(a => new Date().getTime() - new Date(a.timestamp).getTime() < 86400000).length,
      missionsActive: missions.filter(m => m.status === 'ACTIVE').length,
      blueForceCount: blueForceUnits.length,
    })
  }, [assets, alerts, missions, blueForceUnits])

  const kpiCards = [
    {
      label: 'FUERZAS ACTIVAS',
      value: stats.activeAssets,
      icon: Shield,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
    {
      label: 'ALERTAS 24H',
      value: stats.alerts24h,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
    {
      label: 'MISIONES ACTIVAS',
      value: stats.missionsActive,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    {
      label: 'BLUE FORCE',
      value: stats.blueForceCount,
      icon: Radio,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
    },
  ]

  // Mock data for chart
  const threatData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    threats: Math.floor(Math.random() * 10) + (i > 18 ? 15 : 5),
  }))

  return (
    <div className={`${fullscreen ? 'h-screen' : 'h-full'} overflow-auto p-4 space-y-4`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className={`${kpi.bg} ${kpi.border} border rounded p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-[10px] font-mono text-gray-400">{kpi.label}</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            </div>
          )
        })}
      </div>

      {/* Threat Level & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Level */}
        <div className="bg-military-panel rounded border border-military-border p-4">
          <div className="text-xs font-mono text-gray-400 mb-3">NIVEL DE AMENAZA GLOBAL</div>
          <div className={`text-4xl font-bold font-mono text-center py-4 ${
            threatLevel.level === 'CRITICO' ? 'text-red-500 animate-pulse' :
            threatLevel.level === 'ALTO' ? 'text-red-500' :
            threatLevel.level === 'ELEVADO' ? 'text-orange-500' :
            'text-green-500'
          }`}>
            {threatLevel.level}
          </div>
          <div className="text-xs text-center text-gray-500">
            Score: {threatLevel.score.toFixed(2)}
          </div>
        </div>

        {/* Threat Timeline */}
        <div className="lg:col-span-2 bg-military-panel rounded border border-military-border p-4">
          <div className="text-xs font-mono text-gray-400 mb-3">AMENAZAS - ÚLTIMAS 24H</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={threatData}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1f2a', border: '1px solid #2a3f5a' }}
              />
              <Line
                type="monotone"
                dataKey="threats"
                stroke="#00ff41"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Missions & Blue Force */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Missions */}
        <div className="bg-military-panel rounded border border-military-border p-4">
          <div className="text-xs font-mono text-gray-400 mb-3 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            MISIONES ACTIVAS
          </div>
          {missions.filter(m => m.status === 'ACTIVE').length === 0 ? (
            <div className="text-xs text-gray-500">No hay misiones activas</div>
          ) : (
            <div className="space-y-2">
              {missions.filter(m => m.status === 'ACTIVE').map((mission) => (
                <div key={mission.id} className="bg-military-dark/50 rounded p-2 border border-military-border">
                  <div className="text-xs font-bold">{mission.name}</div>
                  <div className="text-[10px] text-gray-400">{mission.mission_type} • {mission.classification_level}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blue Force */}
        <div className="bg-military-panel rounded border border-military-border p-4">
          <div className="text-xs font-mono text-gray-400 mb-3 flex items-center gap-2">
            <Radio className="w-3 h-3" />
            BLUE FORCE TRACKING
          </div>
          {blueForceUnits.length === 0 ? (
            <div className="text-xs text-gray-500">No hay unidades reportando</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {blueForceUnits.slice(0, 10).map((unit) => (
                <div key={unit.id} className="bg-military-dark/50 rounded p-2 border border-military-border flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono">{unit.unit_id}</div>
                    <div className="text-[10px] text-gray-500">
                      📍 {unit.position[0].toFixed(3)}, {unit.position[1].toFixed(3)}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    unit.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
