# SESIS Command Center — Wireframes

Todos los wireframes asumen resolución base 1920x1080px.
Las cotas en `[Wpx]` y `[Hpx]` son dimensiones exactas en pixels.

---

## 1. Layout Principal Desktop — 1920x1080

```
[W:1920 H:1080]
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR  [H:48px]  bg:#0a0d0f  border-bottom:1px solid rgba(0,255,65,0.2)               │
│  ┌──────────────────┐  ┌───────────────────────────────────┐  ┌──────────────────────────┐  │
│  │ ◈ SESIS v2.1     │  │  [scanline animation overlay]     │  │ NODO: EU-WEST-1  ●ONLINE │  │
│  │ COMMAND CENTER   │  │  MISIÓN ACTIVA: OPERACIÓN ATLAS   │  │ UTC 2026-04-14 06:30:12  │  │
│  │ [W:220px H:48px] │  │  CLASIFICACIÓN: ██ SECRETO        │  │ [clasificacion badge]    │  │
│  └──────────────────┘  └───────────────────────────────────┘  └──────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  ┌───────────────────────┐  │
│  │  ASSET PANEL    │  │         TACTICAL MAP                  │  │    INTEL PANEL        │  │
│  │  [W:280px]      │  │  [flex-grow:1, approx W:1220px]      │  │    [W:340px]          │  │
│  │  [H:calc(100vh  │  │  [H:calc(100vh - 48px - 36px        │  │    [H:calc(100vh      │  │
│  │   -48px-36px)]  │  │          - 300px)]  ~396px           │  │     -48px-36px-300px)]│  │
│  │                 │  │                                       │  │    ~396px             │  │
│  │  ┌───────────┐  │  │  bg:#0d1117                          │  │                       │  │
│  │  │ FILTROS   │  │  │  grid: líneas rgba(0,255,65,0.05)   │  │  ┌───────────────────┐│  │
│  │  │ ▣ TODOS   │  │  │                                      │  │  │ THREAT GAUGE      ││  │
│  │  │ ✈ DRONE   │  │  │    ◈ SATÉLITE-01  (rotando)        │  │  │ [W:300px H:80px]  ││  │
│  │  │ ◉ CAMPO   │  │  │                    ▲ DRONE_A01      │  │  │ NIVEL AMENAZA:    ││  │
│  │  │ ⊿ RF SEN  │  │  │      ◉ OP-FIELD-02                 │  │  │ ██████░░░░ 62%    ││  │
│  │  │ ◆ SAT     │  │  │                                      │  │  │ [barra degradée]  ││  │
│  │  └───────────┘  │  │        [!] ALERTA ZONA-B            │  │  └───────────────────┘│  │
│  │                 │  │        borde rojo parpadeando        │  │                       │  │
│  │  ── ACTIVOS ──  │  │                                      │  │  ┌───────────────────┐│  │
│  │                 │  │  [controles zoom: + - ⌖ ]            │  │  │ INTSUM CARD       ││  │
│  │  ▲ DRONE_A01   │  │  [grid coord: 48.856N / 2.352E]     │  │  │ Evaluación IA     ││  │
│  │  ● ACTIVO      │  │                                       │  │  │ generada por ARES ││  │
│  │  BAT 88%       │  │                                       │  │  │ [H:120px scroll]  ││  │
│  │                 │  │                                       │  │  └───────────────────┘│  │
│  │  ◉ VH_BETA_02  │  │                                       │  │                       │  │
│  │  ● EN MOVIM.   │  │                                       │  │  ── PIR LIST ──       │  │
│  │  FUEL 72%      │  │                                       │  │                       │  │
│  │                 │  │                                       │  │  [P1] RF anomalía     │  │
│  │  ⊿ RF_STA_03   │  │                                       │  │  [P2] Geofence viola  │  │
│  │  ● ACTIVO      │  │                                       │  │  [P3] CV match 0.98   │  │
│  │  SEÑAL: FUERTE │  │                                       │  │                       │  │
│  │                 │  │                                       │  │  [BTN: BRIEFING       │  │
│  │  [+ AÑADIR]    │  │                                       │  │   ESTRATÉGICO]        │  │
│  └─────────────────┘  └──────────────────────────────────────┘  └───────────────────────┘  │
│                                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  ARES CHAT PANEL  [H:300px]  border-top:1px solid rgba(0,255,65,0.2)               │   │
│  │                                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │ [BURBUJA ARES]  bg:#1a2332  border-left:3px solid #00ff41                   │  │   │
│  │  │ ARES >  "Anomalía RF detectada en Sector B. Frecuencia: 433.2MHz.           │  │   │
│  │  │          Patrón consistente con hopping coordinado. Confianza: 94%"         │  │   │
│  │  │          [timestamp: 13:42:01Z]                                              │  │   │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │ [BURBUJA USER]  bg:#0f1923  border-left:3px solid #8899a6  alineada derecha │  │   │
│  │  │ OPERADOR >  "Genera opciones de acción para sector B"                        │  │   │
│  │  │              [timestamp: 13:42:15Z]                                          │  │   │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                      │   │
│  │  [INPUT ROW: H:48px]                                                                │   │
│  │  ┌─────────────────────────────────────────────────┐ [ENVIAR] [BRIEFING] [COA]    │   │
│  │  │ > Consulta táctica...                            │ [W:120px][W:100px][W:80px]  │   │
│  │  └─────────────────────────────────────────────────┘                              │   │
│  └──────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  EVENT TICKER  [H:36px]  bg:#0a0d0f  border-top:1px solid rgba(0,255,65,0.15)              │
│  ⚠ CRÍTICO 13:42:01Z — RF anomalía Sector-B  ·  ● ACTIVO 13:40:55Z — CV match UAV          │
│  [scroll continuo horizontal →]                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Panel ARES Chat — Estado Expandido (modal overlay)

```
[overlay bg: rgba(10,13,15,0.85)]
┌──────────────────────────────────────────────────────────────────────┐
│  ARES — SISTEMA DE RAZONAMIENTO ESTRATÉGICO        [W:860px H:640px] │
│  bg:#0d1117  border:1px solid rgba(0,255,65,0.4)  border-radius:8px  │
│  box-shadow: 0 0 40px rgba(0,255,65,0.15)                            │
├──────────────────────────────────────────────────────────────────────┤
│  [TABS H:36px]                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐   │
│  │ CHAT     │ │ COA      │ │ INTSUM   │ │         [X] CERRAR   │   │
│  │ ACTIVO   │ │          │ │          │ └──────────────────────┘   │
│  └──────────┘ └──────────┘ └──────────┘                            │
│  borde-b activo: 2px solid #00ff41                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [SCROLL AREA H:460px overflow-y:auto]                               │
│                                                                        │
│  13:38:20Z                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ◈ ARES                                       [SECRETO ████]  │   │
│  │ bg:#1a2332  border-left:3px solid #00ff41  padding:12px 16px │   │
│  │                                                               │   │
│  │ Análisis completado. Se identificaron 3 indicadores:          │   │
│  │                                                               │   │
│  │ [1] Hopping de frecuencia 433.2MHz → correlación 94%         │   │
│  │ [2] Geofence violation DRONE_A01 → zona restringida 200m     │   │
│  │ [3] CV match 0.98 → vehículo autorizado confirmado           │   │
│  │                                                               │   │
│  │ Recomendación: ELEVACIÓN DE NIVEL DE ALERTA a NARANJA        │   │
│  │                                                               │   │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────────────────┐    │   │
│  │ │ ACEPTAR    │ │ RECHAZAR   │ │ GENERAR COA            │    │   │
│  │ │ RECOM.     │ │            │ │                        │    │   │
│  │ └────────────┘ └────────────┘ └────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  13:42:15Z                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                          ◉ OPERADOR-01       │   │
│  │ bg:#0f1923  border-right:3px solid #8899a6  text-align:right │   │
│  │                                                               │   │
│  │ "Genera opciones de acción para neutralizar Sector B"        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  [THINKING STATE — visible solo cuando ARES procesa]                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ◈ ARES — ANALIZANDO                                          │   │
│  │ bg:#1a2332  border-left:3px solid #00ff41  opacity:0.7       │   │
│  │                                                               │   │
│  │ ● ● ●  [puntos animados — thinkingDots keyframe]             │   │
│  │ Procesando contexto operacional...                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│  [INPUT ROW H:64px  bg:#0f1923  padding:8px 16px]                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────┐               │
│  │ font:'Courier New'  font-size:13px  color:#e0e6ed │               │
│  │ > Consulta táctica...                              │               │
│  │ border:1px solid rgba(0,255,65,0.3)               │               │
│  │ bg:rgba(0,0,0,0.3)  border-radius:4px  H:40px    │               │
│  └──────────────────────────────────────────────────┘               │
│  [BTN ENVIAR W:88px]  [BTN BRIEFING W:100px]  [BTN COA W:72px]     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modal Detalle de Activo

```
[overlay bg: rgba(10,13,15,0.85)]
┌────────────────────────────────────────────────────────────┐
│  DETALLE DE ACTIVO                       [W:560px H:auto]  │
│  bg:#0d1117  border:1px solid rgba(0,255,65,0.4)           │
│  border-radius:8px  box-shadow:0 0 20px rgba(0,255,65,0.2) │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ▲  DRONE_ALPHA_01                    ● ACTIVO       │  │
│  │  font-size:16px uppercase letter-spacing:0.15em      │  │
│  │  color:#00ff41  icon-size:20px                       │  │
│  │  status badge: bg:#16a34a color:#0a0d0f padding:2px 8px│
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [TABS H:32px font-size:11px uppercase letter-spacing:0.1em]│
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ TELEMETRÍA │ │ HISTORIAL  │ │ ALERTAS(2) │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│  tab activo: border-bottom:2px solid #00ff41 color:#00ff41  │
│                                                              │
│  [TELEMETRÍA TAB — contenido]                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  POSICIÓN                     font:'Courier New'   │    │
│  │  LAT    48.8566° N            font-size:13px       │    │
│  │  LON     2.3522° E            color:#00ff41        │    │
│  │  ALT     312m                                      │    │
│  │  ACC     ±2.1m                                     │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  SISTEMA                                           │    │
│  │  BATERÍA   ████████░░  88%   color:#00ff41         │    │
│  │  SEÑAL     ███████░░░  74%   color:#ffd700         │    │
│  │  TEMP      42°C               color:#e0e6ed        │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  CLASIFICACIÓN                                     │    │
│  │  [████ SECRETO]  bg:#dc2626 color:#fff padding:4px │    │
│  │  Autorización: NIVEL-3                             │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  ÚLTIMO EVENTO                                     │    │
│  │  13:42:01Z — RF_ANOMALY HIGH                       │    │
│  │  "Approaching restricted zone NW boundary"         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [FOOTER H:56px  border-top:1px solid rgba(0,255,65,0.15)] │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ANALIZAR CON │  │ CENTRAR EN   │  │ [X] CERRAR       │  │
│  │ ARES         │  │ MAPA         │  │                  │  │
│  │ bg:#00ff41   │  │ bg:transp.   │  │ bg:transparent   │  │
│  │ color:#0a0d0f│  │ border:green │  │ color:#8899a6    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Modal Intelligence Product Viewer

```
[overlay bg: rgba(10,13,15,0.92)]
┌──────────────────────────────────────────────────────────────────────┐
│  INTELLIGENCE PRODUCT                              [W:900px H:720px] │
│  bg:#0d1117  border:1px solid rgba(0,255,65,0.35)  border-radius:8px│
├──────────────────────────────────────────────────────────────────────┤
│  [HEADER H:56px  padding:0 24px  border-bottom:1px solid rgba(0,255,65,0.15)]│
│                                                                        │
│  ┌────────────────────────────────────┐  ┌────────────────────────┐  │
│  │  INTSUM-2026-04-14-001             │  │ [████ SECRETO]         │  │
│  │  Evaluación de Amenaza — Sector B  │  │ bg:#dc2626 H:28px      │  │
│  │  font-size:16px uppercase 0.15em   │  │ color:#fff letter-sp.  │  │
│  │  color:#e0e6ed                     │  │ padding:4px 12px       │  │
│  └────────────────────────────────────┘  └────────────────────────┘  │
│                                                                        │
│  Generado por ARES · 2026-04-14 13:42:01Z · Confianza del modelo: 94%│
│  font-size:11px color:#8899a6                                         │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│  [BODY scroll  H:556px  padding:24px  overflow-y:auto]               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  1. RESUMEN EJECUTIVO                                         │   │
│  │  font-size:11px uppercase letter-spacing:0.15em color:#00ff41│   │
│  │  border-bottom:1px solid rgba(0,255,65,0.15)  mb:8px         │   │
│  │                                                               │   │
│  │  font:'Courier New' font-size:13px color:#e0e6ed line-h:1.6  │   │
│  │  Se detectaron indicadores de actividad coordinada de RF...   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  2. INDICADORES CLAVE                                         │   │
│  │  [mismo estilo de header de sección]                          │   │
│  │                                                               │   │
│  │  ┌─────────────────────────┬────────────┬──────────────────┐ │   │
│  │  │ INDICADOR               │ CONFIANZA  │ FUENTE           │ │   │
│  │  ├─────────────────────────┼────────────┼──────────────────┤ │   │
│  │  │ RF Hopping 433.2MHz     │ 94%        │ RF_STA_03        │ │   │
│  │  │ Geofence violation      │ 87%        │ DRONE_A01        │ │   │
│  │  │ CV vehicle match        │ 98%        │ VH_BETA_02       │ │   │
│  │  └─────────────────────────┴────────────┴──────────────────┘ │   │
│  │  tabla: border:1px solid rgba(0,255,65,0.15)                  │   │
│  │  th: bg:#0f1923 color:#8899a6 font-size:11px                  │   │
│  │  td: font:'Courier New' font-size:13px color:#e0e6ed          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  3. OPCIONES DE ACCIÓN (COA)                                  │   │
│  │                                                               │   │
│  │  COA-A:  Monitoreo pasivo + alerta nivel NARANJA             │   │
│  │          Riesgo: BAJO · Tiempo resp.: inmediato              │   │
│  │          [SELECCIONAR COA-A]  bg:transparent border:#00ff41  │   │
│  │                                                               │   │
│  │  COA-B:  Redirección DRONE_A01 + respuesta campo             │   │
│  │          Riesgo: MEDIO · Tiempo resp.: 8-12min               │   │
│  │          [SELECCIONAR COA-B]  bg:transparent border:#ffd700  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│  [FOOTER H:60px  border-top:1px solid rgba(0,255,65,0.15)  padding:0 24px]│
│                                                                        │
│  ┌───────────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │ EXPORTAR PDF      │  │ IMPRIMIR    │  │ [X] CERRAR           │   │
│  │ bg:transparent    │  │ bg:transp.  │  │ float:right          │   │
│  │ border:#8899a6    │  │ bord:#8899a6│  │ color:#8899a6        │   │
│  │ color:#8899a6     │  │ col:#8899a6 │  │                      │   │
│  │ [W:160px H:36px]  │  │ [W:120px]   │  │ [W:100px H:36px]    │   │
│  └───────────────────┘  └─────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Notas de Implementación para Wireframes

### Grid SVG del Tactical Map
- Lineas verticales y horizontales cada 60px: `stroke="rgba(0,255,65,0.05)" stroke-width="1"`
- Lineas de referencia cada 300px (sector boundary): `stroke="rgba(0,255,65,0.12)" stroke-width="1" stroke-dasharray="4,4"`
- Coordenadas en esquinas: `font-family:'Courier New' font-size:10px fill:#4b5563`

### Asset Markers en Mapa
- Drone activo: `▲` svg text, fill:#00ff41, font-size:16px + glow filter
- Satelite: `◆` svg text, fill:#00ff41, animation:rotate-slow
- Operador campo: `◉` svg text, fill:#00ff41, font-size:14px
- RF Sensor: `△` svg text, fill:#00ff41, font-size:14px
- Alerta critica: `⚠` svg text, fill:#ff0000, animation:pulse-alert
- Cada marker tiene `<title>` para accesibilidad y hover tooltip

### Ticker de Eventos — Colores por Severidad
- CRÍTICO: `color:#ff0000`  prefijo: `⚠ CRÍTICO`
- ALTO: `color:#ff6b35`     prefijo: `▲ ALTO`
- MEDIO: `color:#ffd700`    prefijo: `● MEDIO`
- BAJO: `color:#00ff41`     prefijo: `◦ BAJO`
- INFO: `color:#38bdf8`     prefijo: `◈ INFO`
- Separador entre items: ` · ` color:#4b5563
