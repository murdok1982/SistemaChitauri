import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useSesisStore } from '@/store/sesisStore'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { AlertTicker } from './components/AlertTicker'
import { C2Dashboard } from './features/c2-dashboard/C2Dashboard'
import { IntelPanel } from './features/intel-panel/IntelPanel'
import { TacticalMap } from './features/tactical-map/TacticalMap'
import { AresChat } from './features/ares-chat/AresChat'
import { LogisticsDashboard } from './features/logistics/LogisticsDashboard'
import { CyberDashboard } from './features/cyber/CyberDashboard'
import type { WebSocketMessage, Alert } from '@/types/sesis'

interface AppProps {
  initialTab?: string
}

export function App({ initialTab = 'dashboard' }: AppProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const {
    setAlerts,
    addAlert,
    setAresStatus,
    setWsConnected,
    wsConnected,
    liveMode,
    toggleLiveMode,
  } = useSesisStore()

  const apiUrl = (window as unknown as { SESIS_API_URL?: string }).SESIS_API_URL || 'http://localhost:8000'

  useWebSocket({
    url: `ws://${new URL(apiUrl).host}/ws`,
    onMessage: (data: unknown) => {
      const msg = data as WebSocketMessage
      switch (msg.type) {
        case 'alert':
          addAlert(msg.payload as unknown as Alert)
          break
        case 'threat_change':
          break
        case 'system_status':
          setAresStatus((msg.payload as { status: 'CHECKING' | 'ONLINE' | 'OFFLINE' | 'DEGRADED' }).status)
          break
      }
    },
    onOpen: () => {
      setWsConnected(true)
    },
    onClose: () => {
      setWsConnected(false)
    },
    onError: () => {
      // Errores de WS se reflejan en wsConnected; reconexión gestionada por el hook
    },
    reconnectInterval: 3000,
    maxReconnectAttempts: 20,
  })

  // Fetch inicial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch alerts
        const alertsRes = await fetch(`${apiUrl}/v1/alerts/?severity=HIGH&limit=20`)
        if (alertsRes.ok) {
          const alerts = await alertsRes.json()
          setAlerts(alerts)
        }

        // Check ARES status
        const aresRes = await fetch(`${apiUrl}/v1/brain/status`)
        if (aresRes.ok) {
          const status = await aresRes.json()
          setAresStatus(status.status || 'ONLINE')
        }
      } catch {
        // Backend no disponible: el ticker quedará vacío hasta que llegue WS
      }
    }

    fetchData()
  }, [apiUrl, setAlerts, setAresStatus])

  return (
    <div className="h-screen flex flex-col bg-military-dark text-gray-200 select-none">
      {/* Header */}
      <Header
        wsConnected={wsConnected}
        liveMode={liveMode}
        onToggleLiveMode={toggleLiveMode}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Panel */}
        <main className="flex-1 overflow-auto p-4">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Left: Assets */}
              <div className="col-span-3">
                <TacticalMap />
              </div>

              {/* Center: Map */}
              <div className="col-span-6">
                <C2Dashboard />
              </div>

              {/* Right: Intel */}
              <div className="col-span-3">
                <IntelPanel />
              </div>
            </div>
          )}

          {activeTab === 'c2' && <C2Dashboard fullscreen />}
          {activeTab === 'intel' && <IntelPanel fullscreen />}
          {activeTab === 'chat' && <AresChat fullscreen />}
          {activeTab === 'logistics' && <LogisticsDashboard />}
          {activeTab === 'cyber' && <CyberDashboard />}
        </main>
      </div>

      {/* Footer: Alert Ticker */}
      <AlertTicker />
    </div>
  )
}

