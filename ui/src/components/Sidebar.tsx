import { useState } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import { LayoutDashboard, Radar, Brain, Shield, Truck, Activity } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { wsConnected, aresStatus } = useSesisStore()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'C2 DASHBOARD',
      icon: LayoutDashboard,
      description: 'Comando y Control',
    },
    {
      id: 'c2',
      label: 'C2 / ORBAT',
      icon: Shield,
      description: 'Order of Battle',
    },
    {
      id: 'intel',
      label: 'INTELIGENCIA',
      icon: Radar,
      description: 'Fusión y Productos',
    },
    {
      id: 'chat',
      label: 'ARES CHAT',
      icon: Brain,
      description: `Cerebro IA (${aresStatus})`,
    },
    {
      id: 'logistics',
      label: 'LOGÍSTICA',
      icon: Truck,
      description: 'Suministros y Personal',
    },
    {
      id: 'cyber',
      label: 'CIBERDEFENSA',
      icon: Activity,
      description: 'Kill Chain / Incidentes',
    },
  ]

  return (
    <aside className="w-56 bg-military-panel border-r border-military-border flex flex-col">
      {/* Logo / System Name */}
      <div className="p-3 border-b border-military-border">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-military-green" />
          <div>
            <div className="font-bold text-xs font-mono">SESIS</div>
            <div className="text-[10px] text-gray-400">v3.0 ESTATAL</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-military-green/20 text-military-green border border-military-green/30'
                  : 'text-gray-400 hover:bg-military-border hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-military-green' : 'text-gray-500'}`} />
              <div className="flex-1">
                <div className="font-bold font-mono">{item.label}</div>
                <div className="text-[10px] opacity-60">{item.description}</div>
              </div>
              {item.id === 'chat' && aresStatus === 'ONLINE' && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </button>
          )
        })}
      </nav>

      {/* System Status */}
      <div className="p-3 border-t border-military-border space-y-2">
        <div className="text-[10px] text-gray-400 font-mono">ESTADO SISTEMA</div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={wsConnected ? 'text-green-400' : 'text-red-400'}>
            {wsConnected ? 'CONECTADO' : 'DESCONECTADO'}
          </span>
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          JWT: ACTIVO<br/>
          mTLS: {import.meta.env.PROD ? 'HABILITADO' : 'DESARROLLO'}
        </div>
      </div>
    </aside>
  )
}
