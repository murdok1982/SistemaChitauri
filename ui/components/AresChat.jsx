import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = window.SESIS_API_URL || 'http://localhost:8000';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'ares',
  content: `SISTEMA ARES EN LINEA. CANAL CIFRADO ESTABLECIDO.

**CLASIFICACION: SECRETO**

Soy ARES — Asistente de Razonamiento Estrategico y de Seguridad. Opero como cerebro de inteligencia artificial del sistema SESIS.

Capacidades disponibles:
- **ANALISIS DE AMENAZA**: Evaluacion tactica de amenazas detectadas
- **CURSOS DE ACCION (COA)**: Generacion de alternativas de respuesta
- **BRIEFING ESTRATEGICO**: Resumen ejecutivo completo de la situacion
- **CONSULTA LIBRE**: Cualquier consulta de inteligencia o tactica

Aguardo instrucciones del operador. ARES LISTO.`,
  timestamp: new Date().toISOString(),
};

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
  // Escapar HTML primero para prevenir XSS (el LLM puede generar HTML arbitrario)
  let result = escapeHtml(text);
  // Bold — opera sobre texto ya escapado
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Listas con guion
  result = result.replace(/^- (.+)$/gm, '<li>$1</li>');
  // Saltos de linea
  result = result.replace(/\n/g, '<br />');
  return result;
}

function ChatMessage({ msg }) {
  const isAres = msg.role === 'ares';
  const ts = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('es-ES') : '';

  return (
    <div className={`chat-msg ${isAres ? 'chat-msg-ares' : 'chat-msg-user'}`}>
      <div className="chat-msg-header">
        {isAres ? (
          <span className="chat-sender-ares">[ARES | CLASIFICADO]</span>
        ) : (
          <span className="chat-sender-user">OPERADOR</span>
        )}
        <span className="chat-msg-ts">{ts}</span>
      </div>
      <div
        className="chat-msg-body"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
      />
    </div>
  );
}

export default function AresChat({ alerts, assets, aresStatus, onAresStatusChange }) {
  const [history, setHistory] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeMode, setActiveMode] = useState('LIBRE');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const buildContext = useCallback(() => {
    return {
      assets_count: assets.length,
      active_assets: assets.filter((a) => a.status === 'ACTIVE').map((a) => a.id),
      degraded_assets: assets.filter((a) => a.status === 'DEGRADED').map((a) => a.id),
      critical_alerts: alerts.filter((a) => a.severity === 'CRITICAL').map((a) => a.message),
      high_alerts: alerts.filter((a) => a.severity === 'HIGH').map((a) => a.message),
      timestamp: new Date().toISOString(),
    };
  }, [assets, alerts]);

  const appendMessage = useCallback((role, content) => {
    setHistory((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, role, content, timestamp: new Date().toISOString() },
    ]);
  }, []);

  const callAresApi = useCallback(
    async (endpoint, body) => {
      setIsAnalyzing(true);
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const responseText =
          data.response ||
          data.content ||
          data.result ||
          data.briefing ||
          data.analysis ||
          'RESPUESTA RECIBIDA — SIN CONTENIDO PARSEABLE.';

        appendMessage('ares', responseText);
      } catch (err) {
        appendMessage(
          'ares',
          `**ERROR DE COMUNICACION**\n\nNo se pudo conectar con el servidor ARES.\nError: ${err.message}\n\nVerifique la conexion con el backend en ${API_BASE}`
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [appendMessage]
  );

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isAnalyzing) return;

    appendMessage('user', text);
    setInputText('');

    await callAresApi('/v1/brain/query', {
      prompt: text,
      context: buildContext(),
    });
  }, [inputText, isAnalyzing, appendMessage, callAresApi, buildContext]);

  const handleQuickAction = useCallback(
    async (mode) => {
      setActiveMode(mode);

      if (mode === 'AMENAZA') {
        const critAlerts = alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH');
        const prompt =
          critAlerts.length > 0
            ? `SOLICITUD DE ANALISIS DE AMENAZA. Alertas activas:\n${critAlerts
                .map((a) => `- [${a.severity}] ${a.message} (activo: ${a.asset_id})`)
                .join('\n')}`
            : 'SOLICITUD DE ANALISIS DE AMENAZA. Sin alertas criticas activas. Evaluar situacion general.';

        appendMessage('user', prompt);
        await callAresApi('/v1/brain/analyze-threat', {
          prompt,
          context: buildContext(),
        });
      } else if (mode === 'COA') {
        const prompt =
          'SOLICITAR CURSOS DE ACCION (COA) basados en la situacion tactica actual. Presentar minimo 3 alternativas con ventajas y riesgos.';
        appendMessage('user', prompt);
        await callAresApi('/v1/brain/query', {
          prompt,
          context: buildContext(),
        });
      } else if (mode === 'BRIEFING') {
        appendMessage('user', 'SOLICITAR BRIEFING ESTRATEGICO COMPLETO.');
        await callAresApi('/v1/brain/strategic-briefing', {
          context: buildContext(),
        });
      } else if (mode === 'LIBRE') {
        inputRef.current?.focus();
      }
    },
    [alerts, appendMessage, callAresApi, buildContext]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setHistory([WELCOME_MESSAGE]);
  };

  return (
    <div className="ares-chat-panel">
      <div className="ares-chat-header">
        <div className="ares-header-left">
          <span className="ares-logo">ARES</span>
          <span className="ares-subtitle">CEREBRO TACTICO IA</span>
        </div>
        <div className="ares-header-right">
          <span
            className={`ares-status-badge ${aresStatus === 'ONLINE' ? 'ares-online' : aresStatus === 'OFFLINE' ? 'ares-offline' : 'ares-checking'}`}
          >
            {aresStatus === 'ONLINE' ? (
              <><span className="ares-dot" />EN LINEA</>
            ) : aresStatus === 'OFFLINE' ? (
              <>FUERA DE LINEA</>
            ) : (
              <>VERIFICANDO...</>
            )}
          </span>
          <button className="ares-clear-btn" onClick={clearHistory} title="Limpiar historial">
            LIMPIAR
          </button>
        </div>
      </div>

      <div className="ares-quick-actions">
        <button
          className={`ares-action-btn ${activeMode === 'AMENAZA' ? 'ares-action-active' : ''}`}
          onClick={() => handleQuickAction('AMENAZA')}
          disabled={isAnalyzing}
          aria-label="Solicitar analisis de amenaza a ARES"
        >
          ANALISIS AMENAZA
        </button>
        <button
          className={`ares-action-btn ${activeMode === 'COA' ? 'ares-action-active' : ''}`}
          onClick={() => handleQuickAction('COA')}
          disabled={isAnalyzing}
          aria-label="Solicitar cursos de accion a ARES"
        >
          GENERAR COA
        </button>
        <button
          className={`ares-action-btn ${activeMode === 'BRIEFING' ? 'ares-action-active' : ''}`}
          onClick={() => handleQuickAction('BRIEFING')}
          disabled={isAnalyzing}
          aria-label="Solicitar briefing estrategico a ARES"
        >
          BRIEFING ESTRATEGICO
        </button>
        <button
          className={`ares-action-btn ${activeMode === 'LIBRE' ? 'ares-action-active' : ''}`}
          onClick={() => handleQuickAction('LIBRE')}
          disabled={isAnalyzing}
          aria-label="Modo consulta libre con ARES"
        >
          CONSULTA LIBRE
        </button>
      </div>

      <div className="ares-chat-history" role="log" aria-label="Historial de conversacion con ARES">
        {history.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {isAnalyzing && (
          <div className="ares-analyzing">
            <span className="ares-analyzing-dot" />
            <span className="ares-analyzing-dot" />
            <span className="ares-analyzing-dot" />
            <span className="ares-analyzing-text">ARES ANALIZANDO...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ares-input-row">
        <textarea
          ref={inputRef}
          className="ares-input"
          placeholder="INTRODUCE CONSULTA PARA ARES... (Enter para enviar)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnalyzing}
          rows={2}
          aria-label="Campo de entrada para consulta a ARES"
        />
        <button
          className="ares-send-btn"
          onClick={handleSend}
          disabled={isAnalyzing || !inputText.trim()}
          aria-label="Enviar consulta a ARES"
        >
          ENVIAR
        </button>
      </div>
    </div>
  );
}
