import { useEffect, useState, useCallback } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import type { Alert } from '@/types/sesis'

export function AlertTicker() {
  const { alerts } = useSesisStore()
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>([])

  useEffect(() => {
    setDisplayAlerts(alerts.slice(0, 20))
  }, [alerts])

  const severityColors = {
    CRITICAL: 'text-red-500',
    HIGH: 'text-orange-500',
    MEDIUM: 'text-yellow-500',
    LOW: 'text-green-500',
  }

  const severityPrefix = {
    CRITICAL: '[CRIT]',
    HIGH: '[HIGH]',
    MEDIUM: '[MED]',
    LOW: '[LOW]',
  }

  return (
    <div className="h-9 bg-military-panel border-t border-military-border flex items-center overflow-hidden">
      <div className="flex items-center gap-2 px-3 text-xs font-mono text-gray-400 border-r border-military-border h-full">
        <span className="font-bold">ALERTAS</span>
        <span className="bg-military-border px-1.5 py-0.5 rounded">
          {displayAlerts.length}
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="ticker-scroll flex items-center gap-6 whitespace-nowrap px-4">
          {displayAlerts.length === 0 ? (
            <span className="text-xs text-gray-500">No hay alertas activas</span>
          ) : (
            <>
              {displayAlerts.map((alert) => (
                <span
                  key={alert.id}
                  className={`text-xs font-mono inline-flex items-center gap-1.5 ${
                    severityColors[alert.severity] || 'text-gray-400'
                  }`}
                >
                  <span>[{new Date(alert.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}]</span>
                  <span>{severityPrefix[alert.severity] || '[---]'}</span>
                  <span>{alert.description}</span>
                  {alert.is_anomaly && (
                    <span className="bg-red-900/50 text-red-300 px-1 rounded text-[10px]">ANOMALÍA</span>
                  )}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {displayAlerts.map((alert) => (
                <span
                  key={`dup-${alert.id}`}
                  className={`text-xs font-mono inline-flex items-center gap-1.5 ${
                    severityColors[alert.severity] || 'text-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  <span>[{new Date(alert.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}]</span>
                  <span>{severityPrefix[alert.severity] || '[---]'}</span>
                  <span>{alert.description}</span>
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="px-3 border-l border-military-border h-full flex items-center">
        <span className="text-[10px] text-gray-500 font-mono">
          SISTEMA OPERATIVO
        </span>
      </div>
    </div>
  )
}
