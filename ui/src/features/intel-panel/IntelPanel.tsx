import { useState } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import { BarChart3, Shield, FileText, AlertTriangle, TrendingUp } from 'lucide-react'
import type { IntelProduct, PIR } from '@/types/sesis'

export function IntelPanel({ fullscreen = false }: { fullscreen?: boolean }) {
  const { intelProducts, pirs, threatLevel } = useSesisStore()
  const [activeTab, setActiveTab] = useState<'intsum' | 'pirs' | 'reports'>('intsum')

  const threatColors = {
    'BAJO': 'bg-green-500',
    'MODERADO': 'bg-yellow-500',
    'ELEVADO': 'bg-orange-500',
    'ALTO': 'bg-red-500',
    'CRITICO': 'bg-red-700 animate-pulse',
  }

  return (
    <div className={`${fullscreen ? 'h-screen' : 'h-full'} bg-military-panel rounded border border-military-border flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="p-3 border-b border-military-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <BarChart3 className="w-4 h-4 text-military-green" />
            <span>PANEL INTELIGENCIA</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${threatColors[threatLevel.level] || 'bg-gray-500'}`}>
            {threatLevel.level}
          </div>
        </div>

        {/* Threat Level Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>BAJO</span>
            <span>MODERADO</span>
            <span>ELEVADO</span>
            <span>ALTO</span>
            <span>CRÍTICO</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                threatLevel.level === 'BAJO' ? 'bg-green-500 w-1/5' :
                threatLevel.level === 'MODERADO' ? 'bg-yellow-500 w-2/5' :
                threatLevel.level === 'ELEVADO' ? 'bg-orange-500 w-3/5' :
                threatLevel.level === 'ALTO' ? 'bg-red-500 w-4/5' :
                'bg-red-700 w-full animate-pulse'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-military-border text-[10px] font-mono">
        {(['intsum', 'pirs', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 transition-colors ${
              activeTab === tab
                ? 'bg-military-green/20 text-military-green border-b-2 border-military-green'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab === 'intsum' ? 'INTSUM' : tab === 'pirs' ? 'PIRs' : 'REPORTES'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'intsum' && (
          <>
            {intelProducts.filter(p => p.product_type === 'INTSUM').length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-8">
                No hay productos INTSUM disponibles
              </div>
            ) : (
              intelProducts
                .filter(p => p.product_type === 'INTSUM')
                .map((product) => (
                  <IntelProductCard key={product.id} product={product} />
                ))
            )}
          </>
        )}

        {activeTab === 'pirs' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 font-mono">PIRs ACTIVOS</span>
              <span className="text-[10px] bg-military-border px-1.5 py-0.5 rounded">
                {pirs.filter(p => p.is_active).length}
              </span>
            </div>
            {pirs.filter(p => p.is_active).map((pir) => (
              <PIRCard key={pir.id} pir={pir} />
            ))}
          </>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-2">
            <ReportCard type="HUMINT" level="MEDIUM" summary="Movimiento de tropas sector norte" time="14:30" />
            <ReportCard type="SIGINT" level="HIGH" summary="Interceptación comunicaciones frecuencia 450MHz" time="13:45" />
            <ReportCard type="IMINT" level="LOW" summary="Satélite identifica vehículos sector este" time="12:20" />
            <ReportCard type="CYBER" level="HIGH" summary="Intento intrusión servidor central" time="11:50" />
            <ReportCard type="OSINT" level="LOW" summary="Análisis redes sociales región metropolitana" time="10:15" />
          </div>
        )}
      </div>

      {/* Generate Briefing Button */}
      <div className="p-3 border-t border-military-border">
        <button className="w-full py-2 bg-military-green/20 text-military-green border border-military-green/30 rounded text-xs font-mono hover:bg-military-green/30 transition-colors">
          GENERAR BRIEFING ESTRATÉGICO
        </button>
      </div>
    </div>
  )
}

function IntelProductCard({ product }: { product: IntelProduct }) {
  const classificationColors = {
    'OPEN': 'border-green-500/30 text-green-400',
    'RESTRICTED': 'border-yellow-500/30 text-yellow-400',
    'CONFIDENTIAL': 'border-orange-500/30 text-orange-400',
    'SECRET': 'border-red-500/30 text-red-400',
    'TOP_SECRET': 'border-purple-500/30 text-purple-400',
  }

  return (
    <div className={`p-2 rounded border ${classificationColors[product.classification_level] || 'border-gray-500/30'} bg-military-dark/50`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono font-bold">{product.product_type}</span>
        <span className={`text-[9px] px-1 py-0.5 rounded ${classificationColors[product.classification_level] || 'text-gray-400'}`}>
          {product.classification_level}
        </span>
      </div>
      <div className="text-xs text-gray-300 line-clamp-3">
        {product.content.substring(0, 150)}...
      </div>
      <div className="text-[9px] text-gray-500 mt-1 font-mono">
        {new Date(product.created_at).toLocaleString('es-ES')}
      </div>
    </div>
  )
}

function PIRCard({ pir }: { pir: PIR }) {
  const priorityColors = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-gray-500',
  }

  return (
    <div className="p-2 rounded bg-military-dark/50 border border-military-border">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${priorityColors[pir.priority] || 'bg-gray-500'}`} />
        <span className="text-xs font-bold">{pir.title}</span>
      </div>
      <div className="text-[10px] text-gray-400 line-clamp-2">{pir.description}</div>
      <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-500">
        <span>P{pir.priority}</span>
        <span>•</span>
        <span>{pir.collection_methods.join(', ')}</span>
      </div>
    </div>
  )
}

function ReportCard({ type, level, summary, time }: {
  type: string
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  summary: string
  time: string
}) {
  const levelColors = {
    LOW: 'text-green-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-red-400',
  }

  return (
    <div className="p-2 rounded bg-military-dark/50 border border-military-border flex items-start gap-2">
      <span className={`text-[10px] font-mono font-bold ${levelColors[level]}`}>{type}</span>
      <div className="flex-1">
        <div className="text-xs">{summary}</div>
        <div className="text-[9px] text-gray-500 mt-0.5">{time} UTC</div>
      </div>
      <span className={`text-[10px] ${levelColors[level]}`}>{level}</span>
    </div>
  )
}
