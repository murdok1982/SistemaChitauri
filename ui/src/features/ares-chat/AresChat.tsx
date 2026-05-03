import { useState, useRef, useEffect } from 'react'
import { useSesisStore } from '@/store/sesisStore'
import { Send, Bot, User, Loader2, Shield, AlertCircle } from 'lucide-react'
import type { AresChatMessage } from '@/types/sesis'

type ChatMode = 'THREAT' | 'COA' | 'BRIEFING' | 'FREE'

export function AresChat({ fullscreen = false }: { fullscreen?: boolean }) {
  const { aresStatus } = useSesisStore()
  const [messages, setMessages] = useState<AresChatMessage[]>([
    {
      role: 'ares',
      content: 'SISTEMA ARES ACTIVO. Soy el Asistente de Razonamiento Estratégico y Seguridad. ¿En qué puedo ayudarle?',
      timestamp: new Date().toISOString(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<ChatMode>('FREE')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const apiUrl = (window as any).SESIS_API_URL || 'http://localhost:8000'

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: AresChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      let endpoint = '/v1/brain/query'
      let body: any = { query: input }

      if (mode === 'THREAT') {
        endpoint = '/v1/brain/analyze-threat'
        body = { threat_data: input }
      } else if (mode === 'COA') {
        endpoint = '/v1/brain/generate-coa'
        body = { scenario: input }
      } else if (mode === 'BRIEFING') {
        endpoint = '/v1/brain/strategic-briefing'
        body = { context: input }
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Error en consulta')

      const data = await response.json()
      const aresMessage: AresChatMessage = {
        role: 'ares',
        content: data.response || data.content || 'Análisis completado',
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aresMessage])
    } catch (error) {
      const errorMessage: AresChatMessage = {
        role: 'ares',
        content: '⚠️ Error de comunicación con ARES. Sistema en modo degradado.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions: { mode: ChatMode; label: string; icon: string }[] = [
    { mode: 'THREAT', label: 'ANÁLISIS AMENAZA', icon: '⚠️' },
    { mode: 'COA', label: 'GENERAR COA', icon: '📋' },
    { mode: 'BRIEFING', label: 'BRIEFING', icon: '📊' },
    { mode: 'FREE', label: 'CONSULTA LIBRE', icon: '💬' },
  ]

  return (
    <div className={`${fullscreen ? 'h-screen' : 'h-full'} bg-military-panel rounded border border-military-border flex flex-col`}>
      {/* Header */}
      <div className="p-3 border-b border-military-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-military-green" />
            <div>
              <div className="text-xs font-bold font-mono">ARES</div>
              <div className="text-[10px] text-gray-400">Asistente Estratégico</div>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
            aresStatus === 'ONLINE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              aresStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            {aresStatus}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-military-border flex gap-1 flex-wrap">
        {quickActions.map((action) => (
          <button
            key={action.mode}
            onClick={() => setMode(action.mode)}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              mode === action.mode
                ? 'bg-military-green/30 text-military-green border border-military-green/50'
                : 'bg-military-dark/50 text-gray-400 border border-military-border hover:text-gray-200'
            }`}
          >
            {action.icon} {action.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-2 rounded ${
              msg.role === 'user'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-military-dark/50 text-gray-200 border border-military-border'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {msg.role === 'ares' ? (
                  <Bot className="w-3 h-3 text-military-green" />
                ) : (
                  <User className="w-3 h-3 text-blue-400" />
                )}
                <span className="text-[9px] text-gray-500 font-mono">
                  {msg.role === 'ares' ? 'ARES' : 'OPERADOR'}
                </span>
              </div>
              <div className="text-xs whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-military-dark/50 p-2 rounded border border-military-border flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-military-green animate-spin" />
              <span className="text-xs text-gray-400 font-mono">ARES analizando...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-military-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              mode === 'THREAT' ? 'Describe la amenaza...' :
              mode === 'COA' ? 'Describe el escenario...' :
              mode === 'BRIEFING' ? 'Contexto para briefing...' :
              'Consulta libre a ARES...'
            }
            className="flex-1 bg-military-dark border border-military-border rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-military-green/50 font-mono"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-military-green/20 text-military-green border border-military-green/30 rounded hover:bg-military-green/30 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[9px] text-gray-500 mt-1 text-center font-mono">
          {mode === 'THREAT' ? 'MODO: ANÁLISIS DE AMENAZA' :
           mode === 'COA' ? 'MODO: COURSES OF ACTION' :
           mode === 'BRIEFING' ? 'MODO: BRIEFING ESTRATÉGICO' :
           'MODO: CONSULTA LIBRE'}
        </div>
      </div>
    </div>
  )
}
