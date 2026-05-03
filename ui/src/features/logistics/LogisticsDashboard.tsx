import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck, Pill, Fuel, AlertTriangle, Plus } from 'lucide-react'
import { useSesisStore } from '@/store/sesisStore'
import type { LogisticsSupply } from '@/types/sesis'

export function LogisticsDashboard() {
  const { logisticsSupplies } = useSesisStore()
  const [supplies] = useState<LogisticsSupply[]>([
    { id: '1', item_type: 'AMMO_5_56', quantity: 50000, unit: 'rounds', location_id: 'unit-3', min_threshold: 10000, is_low_stock: false, last_updated: new Date().toISOString() },
    { id: '2', item_type: 'AMMO_7_62', quantity: 30000, unit: 'rounds', location_id: 'unit-3', min_threshold: 5000, is_low_stock: false, last_updated: new Date().toISOString() },
    { id: '3', item_type: 'FUEL', quantity: 5000, unit: 'liters', location_id: 'unit-2', min_threshold: 10000, is_low_stock: true, last_updated: new Date().toISOString() },
    { id: '4', item_type: 'MEDICINE', quantity: 500, unit: 'boxes', location_id: 'unit-1', min_threshold: 100, is_low_stock: false, last_updated: new Date().toISOString() },
    { id: '5', item_type: 'FOOD', quantity: 2000, unit: 'kg', location_id: 'unit-1', min_threshold: 500, is_low_stock: false, last_updated: new Date().toISOString() },
  ])

  const getSupplyIcon = (type: string) => {
    if (type.includes('AMMO')) return '🔫'
    if (type.includes('FUEL')) return '⛽'
    if (type.includes('MED')) return '💊'
    if (type.includes('FOOD')) return '🍞'
    return '📦'
  }

  const lowStock = supplies.filter(s => s.is_low_stock)

  return (
    <div className="space-y-4">
      {/* Alert if low stock */}
      {lowStock.length > 0 && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-300 font-mono">
            ⚠️ {lowStock.length} SUMINISTROS POR DEBAJO DEL UMBRAL
          </span>
        </div>
      )}

      {/* Supply Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {supplies.map(supply => (
          <Card key={supply.id} className={`bg-military-panel border-military-border ${
            supply.is_low_stock ? 'border-red-700/50' : ''
          }`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSupplyIcon(supply.item_type)}</span>
                  <span className="text-xs font-mono">{supply.item_type}</span>
                </div>
                {supply.is_low_stock && (
                  <span className="text-[9px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded">
                    BAJO
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold font-mono">
                {supply.quantity.toLocaleString()}
                <span className="text-xs text-gray-400 ml-1">{supply.unit}</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${supply.is_low_stock ? 'bg-red-500' : 'bg-military-green'}`}
                  style={{ width: `${Math.min(100, (supply.quantity / (supply.min_threshold || 1)) * 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-gray-500 mt-1 font-mono">
                Umbral: {supply.min_threshold} {supply.unit}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MEDEVAC Section */}
      <Card className="bg-military-panel border-military-border">
        <CardHeader>
          <CardTitle className="text-xs font-mono flex items-center gap-2">
            <Pill className="w-4 h-4 text-red-400" />
            MEDEVAC — EVACUACIÓN MÉDICA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { id: 'med-1', priority: 'T1', casualties: 2, status: 'IN_TRANSIT', unit: 'BATALLÓN A' },
              { id: 'med-2', priority: 'T2', casualties: 1, status: 'WAITING', unit: 'BATALLÓN B' },
            ].map(med => (
              <div key={med.id} className="p-2 bg-military-dark/50 rounded border border-military-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold">{med.unit}</div>
                  <div className="text-[10px] text-gray-400">
                    {med.casualties} heridos • Prioridad {med.priority}
                  </div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                  med.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {med.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
