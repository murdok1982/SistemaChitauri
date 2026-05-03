import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, Bug, Globe, Plus } from 'lucide-react'
import { useSesisStore } from '@/store/sesisStore'
import type { CyberIncident } from '@/types/sesis'

const KILL_CHAIN_STAGES = ['RECON', 'WEAPONIZE', 'DELIVER', 'EXPLOIT', 'INSTALL', 'C2', 'ACTIONS']

export function CyberDashboard() {
  const { cyberIncidents } = useSesisStore()
  const [incidents] = useState<CyberIncident[]>([
    {
      id: 'cyber-1',
      incident_type: 'INTRUSION',
      severity: 'HIGH',
      target_system: 'SISTEMA_COMANDO',
      kill_chain_stage: 'EXPLOIT',
      status: 'INVESTIGATING',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cyber-2',
      incident_type: 'DDOS',
      severity: 'MEDIUM',
      target_system: 'SERVIDOR_PUBLICO',
      kill_chain_stage: 'ACTIONS',
      status: 'CONTAINED',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cyber-3',
      incident_type: 'MALWARE',
      severity: 'CRITICAL',
      target_system: 'RED_DE_TELEMETRIA',
      kill_chain_stage: 'INSTALL',
      status: 'OPEN',
      created_at: new Date().toISOString(),
    },
  ])

  return (
    <div className="space-y-4">
      {/* Kill Chain Visualization */}
      <Card className="bg-military-panel border-military-border">
        <CardHeader>
          <CardTitle className="text-xs font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            CYBER KILL CHAIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {KILL_CHAIN_STAGES.map((stage, idx) => {
              const activeIncidents = incidents.filter(i => i.kill_chain_stage === stage)
              return (
                <div key={stage} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-mono ${
                    activeIncidents.length > 0
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-gray-700/50 text-gray-500'
                  }`}>
                    {activeIncidents.length}
                  </div>
                  <span className="text-[8px] text-gray-400 font-mono text-center">
                    {stage}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <Card className="bg-military-panel border-military-border">
        <CardHeader>
          <CardTitle className="text-xs font-mono flex items-center gap-2">
            <Bug className="w-4 h-4 text-orange-400" />
            INCIDENTES DE CIBERDEFENSA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incidents.map(inc => (
              <div key={inc.id} className="p-2 bg-military-dark/50 rounded border border-military-border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-3 h-3 ${
                      inc.severity === 'CRITICAL' ? 'text-red-500' :
                      inc.severity === 'HIGH' ? 'text-orange-500' :
                      'text-yellow-500'
                    }`} />
                    <span className="text-xs font-mono">{inc.incident_type}</span>
                  </div>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${
                    inc.status === 'CONTAINED' ? 'bg-green-500/20 text-green-400' :
                    inc.status === 'INVESTIGATING' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {inc.status}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400">
                  Target: {inc.target_system} • Stage: {inc.kill_chain_stage}
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-3 bg-military-dark/50 text-xs hover:bg-military-border">
            <Plus className="w-3 h-3 mr-1" />
            REPORTAR INCIDENTE
          </Button>
        </CardContent>
      </Card>

      {/* Threat Hunting */}
      <Card className="bg-military-panel border-military-border">
        <CardHeader>
          <CardTitle className="text-xs font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            THREAT HUNTING
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="IOC: IP, hash, dominio..."
              className="flex-1 bg-military-dark border border-military-border rounded px-2 py-1 text-xs font-mono"
            />
            <Button size="sm" className="bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 text-xs">
              BUSCAR
            </Button>
          </div>
          <div className="mt-3 text-[10px] text-gray-500 font-mono">
            📊 Últimos resultados: 0 coincidencias
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
