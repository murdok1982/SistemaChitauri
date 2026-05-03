import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Shield, Plus, TreePine } from 'lucide-react'
import { useSesisStore } from '@/store/sesisStore'
import type { ORBATUnit, Mission } from '@/types/sesis'

export function OrderOfBattle() {
  const { assets } = useSesisStore()
  const [units] = useState<ORBATUnit[]>([
    { id: 'unit-1', name: 'CUARTEL GENERAL', unit_type: 'tierra', status: 'ACTIVE', classification_level: 'SECRET' },
    { id: 'unit-2', name: '1ª BRIGADA MECANIZADA', unit_type: 'tierra', parent_id: 'unit-1', status: 'ACTIVE', classification_level: 'SECRET' },
    { id: 'unit-3', name: 'BATALLÓN A', unit_type: 'tierra', parent_id: 'unit-2', status: 'ACTIVE', classification_level: 'CONFIDENTIAL' },
    { id: 'unit-4', name: 'BATALLÓN B', unit_type: 'tierra', parent_id: 'unit-2', status: 'DEGRADED', classification_level: 'CONFIDENTIAL' },
    { id: 'unit-5', name: 'ALA DE COMBATE', unit_type: 'aire', parent_id: 'unit-1', status: 'ACTIVE', classification_level: 'SECRET' },
    { id: 'unit-6', name: 'GRUPO NAVAL', unit_type: 'mar', parent_id: 'unit-1', status: 'ACTIVE', classification_level: 'SECRET' },
  ])

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'tierra': return '⛰️'
      case 'mar': return '⚓'
      case 'aire': return '✈️'
      case 'espacio': return '🛰️'
      case 'ciber': return '💻'
      default: return '📍'
    }
  }

  const renderUnitTree = (parentId?: string, depth = 0) => {
    const children = units.filter(u => u.parent_id === parentId)
    return children.map(unit => (
      <div key={unit.id} style={{ marginLeft: `${depth * 20}px` }} className="mb-1">
        <div className={`flex items-center gap-2 p-1.5 rounded text-xs hover:bg-military-border cursor-pointer ${
          unit.status === 'DEGRADED' ? 'text-orange-400' : 'text-gray-200'
        }`}>
          <span>{getUnitIcon(unit.unit_type)}</span>
          <TreePine className="w-3 h-3 text-military-green" />
          <span className="font-mono">{unit.name}</span>
          <span className={`ml-auto text-[9px] px-1 py-0.5 rounded ${
            unit.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
          }`}>
            {unit.status}
          </span>
        </div>
        {renderUnitTree(unit.id, depth + 1)}
      </div>
    ))
  }

  return (
    <Card className="bg-military-panel border-military-border">
      <CardHeader>
        <CardTitle className="text-xs font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-military-green" />
          ORDER OF BATTLE (ORBAT)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-3">
          <span className="text-[10px] text-gray-400 font-mono">
            {units.length} UNIDADES
          </span>
          <Button size="sm" variant="outline" className="text-[10px] h-6">
            <Plus className="w-3 h-3 mr-1" />
            AGREGAR
          </Button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {renderUnitTree()}
        </div>
      </CardContent>
    </Card>
  )
}

export function MissionPlanner() {
  const { missions, addMission } = useSesisStore()
  const [newMission, setNewMission] = useState({ name: '', type: 'OFENSIVA' })

  return (
    <Card className="bg-military-panel border-military-border">
      <CardHeader>
        <CardTitle className="text-xs font-mono flex items-center gap-2">
          <Plus className="w-4 h-4 text-military-green" />
          PLANIFICADOR DE MISIONES
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-400 font-mono">NOMBRE MISIÓN</label>
          <input
            type="text"
            value={newMission.name}
            onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
            className="w-full mt-1 bg-military-dark border border-military-border rounded px-2 py-1 text-xs font-mono"
            placeholder="Ej: OPERACIÓN ESCUDO"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-mono">TIPO</label>
          <select
            value={newMission.type}
            onChange={(e) => setNewMission({ ...newMission, type: e.target.value })}
            className="w-full mt-1 bg-military-dark border border-military-border rounded px-2 py-1 text-xs font-mono"
          >
            <option value="OFENSIVA">OFENSIVA</option>
            <option value="DEFENSIVA">DEFENSIVA</option>
            <option value="PEACEKEEPING">PEACEKEEPING</option>
          </select>
        </div>
        <Button
          onClick={() => {
            if (newMission.name) {
              addMission({
                id: `mission-${Date.now()}`,
                name: newMission.name,
                mission_type: newMission.type as any,
                status: 'PLANNED',
                classification_level: 'SECRET',
              })
              setNewMission({ name: '', type: 'OFENSIVA' })
            }
          }}
          className="w-full bg-military-green/20 text-military-green border border-military-green/30 hover:bg-military-green/30 text-xs"
        >
          CREAR MISIÓN
        </Button>

        {/* Active Missions */}
        <div className="space-y-2 mt-4">
          <div className="text-[10px] text-gray-400 font-mono">MISIONES PLANIFICADAS</div>
          {missions.slice(0, 5).map(m => (
            <div key={m.id} className="p-2 bg-military-dark/50 rounded border border-military-border">
              <div className="text-xs font-bold">{m.name}</div>
              <div className="text-[10px] text-gray-400">{m.mission_type} • {m.status}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
