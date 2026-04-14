# SESIS Command Center — Especificaciones UI/UX

Documento normativo para implementación del dashboard táctico.
Toda medida es en px salvo indicación. Todo color en hex o rgba.
Version: 1.0 — 2026-04-14

---

## 1. Sistema de Diseño Militar

### 1.1 Filosofia de Diseño

El Command Center opera bajo tres premisas:
1. **Densidad informativa**: pantallas de alto DPI en salas de operaciones — mostrar máximo dato relevante sin ruido visual.
2. **Jerarquía de urgencia**: el ojo del operador debe ir al elemento más crítico en menos de 500ms.
3. **Estado siempre visible**: ningún estado del sistema puede estar oculto detrás de una interacción.

---

### 1.2 Paleta de Colores

#### Backgrounds
| Token              | Hex        | Uso |
|:---|:---|:---|
| `bg.base`          | `#0a0d0f`  | Fondo raiz del documento, ticker |
| `bg.panel`         | `#0d1117`  | Paneles principales, modales |
| `bg.card`          | `#1a2332`  | Cards dentro de paneles, burbujas ARES |
| `bg.sidebar`       | `#0f1923`  | Sidebar de assets, fondo input chat |
| `bg.overlay`       | `rgba(10,13,15,0.85)` | Overlay de modales |
| `bg.glass`         | `rgba(13,17,23,0.72)` | Elementos con efecto cristal/blur |

#### Colores de Accion y Estado
| Token                     | Hex / rgba                  | Uso |
|:---|:---|:---|
| `primary.green`           | `#00ff41`                   | Primario — activo, datos en tiempo real |
| `primary.greenDim`        | `rgba(0,255,65,0.15)`       | Fondos hover, surfaces activos |
| `primary.greenBorder`     | `rgba(0,255,65,0.2)`        | Bordes en reposo |
| `primary.greenHover`      | `rgba(0,255,65,0.6)`        | Bordes en hover/active |
| `primary.greenGlow`       | `rgba(0,255,65,0.5)`        | box-shadow glow |
| `classification.open`     | `#00ff41`                   | Nivel ABIERTO |
| `classification.restricted` | `#ffd700`                | Nivel RESTRINGIDO |
| `classification.confidential` | `#ff6b35`             | Nivel CONFIDENCIAL |
| `classification.secret`   | `#ff0000`                   | Nivel SECRETO |
| `classification.topSecret`| `#9400d3`                   | Nivel ALTO SECRETO |
| `severity.critical`       | `#ff0000`                   | Alerta critica |
| `severity.high`           | `#ff6b35`                   | Alerta alta |
| `severity.medium`         | `#ffd700`                   | Alerta media |
| `severity.low`            | `#00ff41`                   | Alerta baja / info positiva |
| `severity.info`           | `#38bdf8`                   | Información general |

#### Texto
| Token              | Hex        | Uso |
|:---|:---|:---|
| `text.primary`     | `#e0e6ed`  | Cuerpo principal, contenido |
| `text.secondary`   | `#8899a6`  | Labels, timestamps, metadata |
| `text.accent`      | `#00ff41`  | Datos en tiempo real, valores clave |
| `text.muted`       | `#4b5563`  | Texto deshabilitado, placeholders |
| `text.danger`      | `#ff0000`  | Errores, críticos |
| `text.warning`     | `#ffd700`  | Advertencias |

#### Bordes
| Token              | rgba                     | Uso |
|:---|:---|:---|
| `border.default`   | `rgba(0,255,65,0.2)`     | Paneles en reposo |
| `border.hover`     | `rgba(0,255,65,0.6)`     | Hover sobre elementos interactivos |
| `border.active`    | `rgba(0,255,65,0.8)`     | Elemento seleccionado |
| `border.panel`     | `rgba(255,255,255,0.06)` | Divisores internos de panel |
| `border.danger`    | `rgba(255,0,0,0.6)`      | Estado de alerta |
| `border.warning`   | `rgba(255,215,0,0.5)`    | Estado degradado |

---

### 1.3 Tipografia

El sistema usa dos familias tipograficas con roles estrictamente separados.

#### Fuentes

```css
/* Datos operacionales: coordenadas, IDs, timestamps, valores numericos */
--font-data: 'Courier New', 'Lucida Console', monospace;

/* UI: etiquetas, titulos, navegacion, botones */
--font-ui: 'Arial Narrow', 'Roboto Condensed', 'Liberation Sans Narrow', sans-serif;
```

#### Escala de Tamaños
| Nombre    | Tamano | Font       | Peso | Uso |
|:---|:---|:---|:---|:---|
| `label`   | 11px   | UI         | 400  | Etiquetas de campo, column headers |
| `base`    | 13px   | Data/UI    | 400  | Cuerpo general, datos, chat |
| `header`  | 14px   | UI         | 700  | Titulos de panel, sección |
| `headerLg`| 16px   | UI         | 700  | Titulos de modal, asset name |
| `metric`  | 24px   | Data       | 700  | Metricas destacadas (bat%, threat%) |
| `metricLg`| 32px   | Data       | 700  | Valor principal en gauge |
| `title`   | 20px   | UI         | 700  | Nombre de pantalla, modal title |

#### Estilo Militar

```css
/* Aplicar a todos los titulos de sección y labels de panel */
.military-label {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #8899a6;
}

/* Datos en tiempo real */
.data-value {
  font-family: var(--font-data);
  font-size: 13px;
  color: #00ff41;
}
```

---

### 1.4 Iconografia Militar

Sistema basado en caracteres Unicode. Sin dependencia de icon libraries externas.

| Activo / Concepto  | Caracter | Alternativa | Color base |
|:---|:---|:---|:---|
| Drone              | `▲`      | `✈`         | `#00ff41` |
| Satelite           | `◆`      | `⬡`         | `#00ff41` |
| Operador de campo  | `◉`      | `⊕`         | `#00ff41` |
| Sensor RF          | `△`      | `⊿`         | `#00ff41` |
| Cyber / Nodo       | `⬡`      | `◈`         | `#00ff41` |
| Vehiculo           | `■`      | `▣`         | `#00ff41` |
| ARES (IA)          | `◈`      |             | `#00ff41` |
| Alerta critica     | `⚠`      |             | `#ff0000` |
| Confirmado / OK    | `✓`      |             | `#00ff41` |
| Error / X          | `✕`      |             | `#ff0000` |
| Clasificacion ABIERTO   | `⬜`  |            | `#00ff41` |
| Clasificacion RESTRINGIDO | `🟡` |           | `#ffd700` |
| Clasificacion CONFIDENCIAL | `🟠` |          | `#ff6b35` |
| Clasificacion SECRETO | `🔴`   |             | `#ff0000` |
| Clasificacion ALTO SECRETO | `⬛` |          | `#9400d3` |

#### Badge de Clasificacion (componente)

```css
.classification-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-radius: 2px;
}

.classification-badge.secret {
  background: #dc2626;
  color: #fff;
}

.classification-badge.top-secret {
  background: #9400d3;
  color: #fff;
  box-shadow: 0 0 8px rgba(148,0,211,0.5);
}

.classification-badge.confidential {
  background: #ea580c;
  color: #fff;
}

.classification-badge.restricted {
  background: #b45309;
  color: #fff;
}

.classification-badge.open {
  background: transparent;
  color: #00ff41;
  border: 1px solid rgba(0,255,65,0.4);
}
```

---

### 1.5 Estados Visuales de Activos

#### ACTIVO
```css
.asset-active {
  border: 1px solid rgba(0,255,65,0.6);
  border-left: 3px solid #00ff41;
  box-shadow: 0 0 8px rgba(0,255,65,0.5);
}
.asset-active .status-indicator {
  background: #00ff41;
  /* no animation — estado estable */
}
```

#### DEGRADADO
```css
.asset-degraded {
  border: 1px solid rgba(255,215,0,0.5);
  border-left: 3px solid #ffd700;
}
.asset-degraded .status-indicator {
  background: #ffd700;
  animation: degraded-blink 2s ease-in-out infinite;
}
```

#### INACTIVO / MUERTO
```css
.asset-inactive {
  border: 1px solid rgba(75,85,99,0.3);
  border-left: 3px solid #4b5563;
  opacity: 0.5;
}
.asset-inactive .status-indicator {
  background: #374151;
}
```

#### EN ALERTA
```css
.asset-alert {
  border: 1px solid rgba(255,0,0,0.6);
  border-left: 3px solid #ff0000;
  animation: pulse-alert 0.5s ease-in-out infinite;
}
.asset-alert .status-indicator {
  background: #ff0000;
  animation: pulse-alert 0.5s ease-in-out infinite;
}
```

#### SELECCIONADO
```css
.asset-selected {
  border: 1px solid rgba(0,255,65,0.8);
  border-left: 3px solid #00ff41;
  background: rgba(0,255,65,0.1);
  box-shadow: inset 0 0 12px rgba(0,255,65,0.08);
}
```

---

## 2. Componentes UI — Especificaciones

### 2.1 Header Bar

```
Dimensiones:  W:100vw  H:48px
Position:     fixed top:0  z-index:50
Background:   #0a0d0f
Border-bottom: 1px solid rgba(0,255,65,0.2)
```

**Layout interno (flex, items-center, space-between):**

```
[ZONA IZQUIERDA — W:220px]
  ◈ SESIS v2.1
  Font: var(--font-ui) 14px 700 uppercase letter-spacing:0.15em color:#00ff41
  Subtitulo: "COMMAND CENTER" font-size:10px color:#8899a6 letter-spacing:0.2em

[ZONA CENTRO — flex-grow:1]
  Texto misión activa: font:var(--font-data) 13px color:#e0e6ed
  "MISIÓN ACTIVA: OPERACIÓN ATLAS"
  Classification badge centrado debajo
  Efecto scanline superpuesto (::after pseudoelemento)

[ZONA DERECHA — W:280px]
  Nodo: "EU-WEST-1" font:var(--font-data) 11px color:#8899a6
  Timestamp UTC: font:var(--font-data) 13px color:#00ff41 (actualiza cada 1s)
  Status dot: 8px circle bg:#00ff41 box-shadow:0 0 6px rgba(0,255,65,0.8)
  Label: "ONLINE" font:var(--font-ui) 11px color:#00ff41 uppercase
```

**CSS:**
```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background: #0a0d0f;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 50;
  overflow: hidden; /* contiene scanline */
}

.header::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,255,65,0.03), transparent);
  animation: scanline 8s linear infinite;
  pointer-events: none;
}
```

---

### 2.2 Asset List Panel (Sidebar)

```
Dimensiones:  W:280px  H:calc(100vh - 48px - 36px)
Position:     fixed left:0 top:48px
Background:   #0f1923
Border-right: 1px solid rgba(0,255,65,0.2)
Overflow-y:   auto (scrollbar custom — ver CSS)
Z-index:      10
```

**Estructura interna:**

```
[FILTROS — H:44px  border-bottom:1px solid rgba(0,255,65,0.1)]
  Botones de filtro, disposicion horizontal, font-size:11px
  Filtros: TODOS / ▲ DRONE / ◉ CAMPO / △ RF / ◆ SAT
  Activo: color:#00ff41 border-bottom:2px solid #00ff41
  Inactivo: color:#8899a6

[CONTADOR — H:28px padding:4px 12px]
  "X ACTIVOS · Y ALERTAS" font:var(--font-data) 11px color:#8899a6

[LISTA DE ASSETS — flex:1 overflow-y:auto]
  Cada item: AssetListItem (ver abajo)

[BTN AÑADIR ACTIVO — H:40px border-top:1px solid rgba(0,255,65,0.1)]
  "+ AÑADIR ACTIVO"  full-width  bg:transparent
  color:#8899a6 hover:color:#00ff41 hover:bg:rgba(0,255,65,0.05)
```

**AssetListItem:**
```css
.asset-list-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  margin: 0 8px 4px 8px;
  background: rgba(255,255,255,0.02);
  border-radius: 6px;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 64px; /* area de toque accesible */
}

.asset-list-item:hover {
  background: rgba(0,255,65,0.05);
  border-left-color: rgba(0,255,65,0.4);
}

.asset-list-item .asset-name {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 700;
  color: #e0e6ed;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.asset-list-item .asset-meta {
  font-family: var(--font-ui);
  font-size: 11px;
  color: #8899a6;
  display: flex;
  justify-content: space-between;
}

/* Status pill */
.status-pill {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 2px;
  font-family: var(--font-ui);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.status-pill.active   { background: rgba(0,255,65,0.15);  color: #00ff41; }
.status-pill.degraded { background: rgba(255,215,0,0.15); color: #ffd700; }
.status-pill.inactive { background: rgba(75,85,99,0.2);   color: #4b5563; }
.status-pill.alert    { background: rgba(255,0,0,0.15);   color: #ff0000; }
```

**Scrollbar personalizado:**
```css
.asset-list::-webkit-scrollbar        { width: 4px; }
.asset-list::-webkit-scrollbar-track  { background: transparent; }
.asset-list::-webkit-scrollbar-thumb  { background: rgba(0,255,65,0.2); border-radius: 2px; }
.asset-list::-webkit-scrollbar-thumb:hover { background: rgba(0,255,65,0.4); }
```

---

### 2.3 Tactical Map

```
Dimensiones:  flex-grow:1  H:calc(100vh - 48px - 36px - 300px)
Background:   #0d1117
Border:       1px solid rgba(0,255,65,0.15)
Position:     relativa (para markers absolutos)
Overflow:     hidden
```

**Grid SVG superpuesto:**
```html
<!-- SVG que ocupa 100% del contenedor -->
<svg class="tactical-grid" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Grid menor: cada 60px -->
  <defs>
    <pattern id="grid-minor" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none"
            stroke="rgba(0,255,65,0.05)" stroke-width="1"/>
    </pattern>
    <!-- Grid mayor: cada 300px (sector boundaries) -->
    <pattern id="grid-major" width="300" height="300" patternUnits="userSpaceOnUse">
      <path d="M 300 0 L 0 0 0 300" fill="none"
            stroke="rgba(0,255,65,0.12)" stroke-width="1"
            stroke-dasharray="4,4"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid-minor)"/>
  <rect width="100%" height="100%" fill="url(#grid-major)"/>
</svg>
```

**Markers de Activos:**
```css
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.map-marker .icon {
  font-size: 16px;
  line-height: 1;
  color: #00ff41;
  filter: drop-shadow(0 0 4px rgba(0,255,65,0.8));
  transition: all 0.2s;
}

.map-marker:hover .icon {
  filter: drop-shadow(0 0 8px rgba(0,255,65,1));
  transform: scale(1.2);
}

.map-marker .label {
  font-family: var(--font-data);
  font-size: 10px;
  color: #8899a6;
  background: rgba(10,13,15,0.8);
  padding: 1px 4px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
}

/* Satellite — rotación continua del icon */
.map-marker.satellite .icon {
  animation: rotate-slow 20s linear infinite;
  display: inline-block;
}

/* Alerta — parpadeo rápido */
.map-marker.alert .icon {
  color: #ff0000;
  filter: drop-shadow(0 0 6px rgba(255,0,0,0.9));
  animation: pulse-alert 0.5s ease-in-out infinite;
}
```

**Controles de Zoom:**
```css
.map-controls {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-control-btn {
  width: 32px;
  height: 32px;
  background: rgba(13,17,23,0.9);
  border: 1px solid rgba(0,255,65,0.3);
  color: #00ff41;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  font-family: var(--font-ui);
}

.map-control-btn:hover {
  background: rgba(0,255,65,0.1);
  border-color: rgba(0,255,65,0.6);
  box-shadow: 0 0 8px rgba(0,255,65,0.3);
}
```

**Tooltip de Coordenadas (esquina inferior izquierda):**
```css
.map-coords {
  position: absolute;
  bottom: 12px;
  left: 12px;
  font-family: var(--font-data);
  font-size: 11px;
  color: #4b5563;
  background: rgba(10,13,15,0.8);
  padding: 4px 8px;
  border-radius: 3px;
  border: 1px solid rgba(0,255,65,0.08);
}
```

---

### 2.4 Intel Panel

```
Dimensiones:  W:340px  H:calc(100vh - 48px - 36px - 300px)
Background:   #0d1117
Border-left:  1px solid rgba(0,255,65,0.2)
Overflow-y:   auto
Padding:      16px
```

**Threat Gauge:**
```css
.threat-gauge {
  background: #0f1923;
  border: 1px solid rgba(0,255,65,0.15);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.threat-gauge .label {
  font-family: var(--font-ui);
  font-size: 11px;
  color: #8899a6;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 8px;
}

.threat-gauge .value {
  font-family: var(--font-data);
  font-size: 32px;
  font-weight: 700;
  color: #ffd700; /* cambia segun nivel: green<40 / yellow 40-70 / red>70 */
  line-height: 1;
  margin-bottom: 6px;
}

/* Barra de progreso */
.threat-bar-track {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}

.threat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease, background-color 0.6s ease;
  /* background es dinamico segun nivel:
     <40%: linear-gradient(90deg, #00ff41, #22c55e)
     40-70%: linear-gradient(90deg, #ffd700, #f59e0b)
     >70%: linear-gradient(90deg, #ff6b35, #ff0000)  */
}
```

**INTSUM Card:**
```css
.intsum-card {
  background: #0f1923;
  border: 1px solid rgba(0,255,65,0.15);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.intsum-card .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.intsum-card .title {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  color: #00ff41;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.intsum-card .timestamp {
  font-family: var(--font-data);
  font-size: 10px;
  color: #4b5563;
}

.intsum-card .body {
  font-family: var(--font-data);
  font-size: 12px;
  color: #e0e6ed;
  line-height: 1.5;
  max-height: 100px;
  overflow-y: auto;
}
```

**PIR List:**
```css
.pir-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer;
  transition: background 0.15s;
}

.pir-item:hover {
  background: rgba(0,255,65,0.03);
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.pir-item .priority {
  font-family: var(--font-data);
  font-size: 11px;
  color: #4b5563;
  min-width: 28px;
  text-transform: uppercase;
}

.pir-item .text {
  font-family: var(--font-ui);
  font-size: 12px;
  color: #8899a6;
  flex: 1;
  line-height: 1.4;
}

.pir-item .severity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
```

**Boton Briefing Estrategico:**
```css
.btn-briefing {
  width: 100%;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(0,255,65,0.4);
  color: #00ff41;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-briefing:hover {
  background: rgba(0,255,65,0.08);
  border-color: rgba(0,255,65,0.7);
  box-shadow: 0 0 12px rgba(0,255,65,0.2);
}

/* Estado loading durante generacion */
.btn-briefing.loading {
  color: #4b5563;
  border-color: rgba(75,85,99,0.4);
  cursor: not-allowed;
  pointer-events: none;
}
```

---

### 2.5 ARES Chat Panel

```
Dimensiones:  W:100%  H:300px
Position:     fixed bottom:36px  (sobre el ticker)
Background:   #0d1117
Border-top:   1px solid rgba(0,255,65,0.2)
Display:      flex  flex-direction:column
```

**Burbujas de mensaje:**
```css
/* Mensaje de ARES */
.bubble-ares {
  max-width: 80%;
  padding: 10px 14px;
  background: #1a2332;
  border-left: 3px solid #00ff41;
  border-radius: 0 6px 6px 0;
  margin: 4px 12px;
  font-family: var(--font-data);
  font-size: 13px;
  color: #e0e6ed;
  line-height: 1.5;
  align-self: flex-start;
}

.bubble-ares .header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.bubble-ares .sender {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  color: #00ff41;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bubble-ares .timestamp {
  font-family: var(--font-data);
  font-size: 10px;
  color: #4b5563;
}

/* Mensaje de operador */
.bubble-operator {
  max-width: 80%;
  padding: 10px 14px;
  background: #0f1923;
  border-right: 3px solid #8899a6;
  border-radius: 6px 0 0 6px;
  margin: 4px 12px;
  font-family: var(--font-data);
  font-size: 13px;
  color: #e0e6ed;
  line-height: 1.5;
  align-self: flex-end;
  text-align: right;
}

/* Estado thinking de ARES */
.bubble-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #1a2332;
  border-left: 3px solid rgba(0,255,65,0.4);
  border-radius: 0 6px 6px 0;
  margin: 4px 12px;
  opacity: 0.7;
  font-family: var(--font-ui);
  font-size: 12px;
  color: #8899a6;
  font-style: italic;
  align-self: flex-start;
}

.thinking-dot {
  width: 6px;
  height: 6px;
  background: #00ff41;
  border-radius: 50%;
  animation: thinking-dots 1.4s ease-in-out infinite;
}
.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }
```

**Action buttons dentro de burbuja ARES:**
```css
.bubble-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.bubble-action-btn {
  height: 28px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid;
  border-radius: 3px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.15s;
}

.bubble-action-btn.accept {
  border-color: rgba(0,255,65,0.5);
  color: #00ff41;
}
.bubble-action-btn.accept:hover {
  background: rgba(0,255,65,0.1);
}

.bubble-action-btn.reject {
  border-color: rgba(255,0,0,0.4);
  color: #ff6b35;
}
.bubble-action-btn.reject:hover {
  background: rgba(255,0,0,0.08);
}

.bubble-action-btn.coa {
  border-color: rgba(255,215,0,0.4);
  color: #ffd700;
}
.bubble-action-btn.coa:hover {
  background: rgba(255,215,0,0.08);
}
```

**Input Row:**
```css
.chat-input-row {
  height: 56px;
  padding: 8px 12px;
  background: #0f1923;
  border-top: 1px solid rgba(0,255,65,0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  height: 36px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,255,65,0.25);
  border-radius: 4px;
  padding: 0 12px;
  font-family: var(--font-data);
  font-size: 13px;
  color: #e0e6ed;
  outline: none;
  transition: border-color 0.15s;
}

.chat-input::placeholder {
  color: #4b5563;
}

.chat-input:focus {
  border-color: rgba(0,255,65,0.6);
  box-shadow: 0 0 0 2px rgba(0,255,65,0.08);
}

.chat-submit-btn {
  height: 36px;
  padding: 0 16px;
  background: #00ff41;
  border: none;
  border-radius: 4px;
  color: #0a0d0f;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.chat-submit-btn:hover {
  background: #33ff66;
  box-shadow: 0 0 12px rgba(0,255,65,0.5);
}

.chat-secondary-btn {
  height: 36px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid rgba(0,255,65,0.3);
  border-radius: 4px;
  color: #00ff41;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.chat-secondary-btn:hover {
  background: rgba(0,255,65,0.08);
  border-color: rgba(0,255,65,0.6);
}
```

---

### 2.6 Event Ticker

```
Dimensiones:  W:100vw  H:36px
Position:     fixed bottom:0
Background:   #0a0d0f
Border-top:   1px solid rgba(0,255,65,0.15)
Overflow:     hidden
Z-index:      5
```

```css
.event-ticker {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 36px;
  background: #0a0d0f;
  border-top: 1px solid rgba(0,255,65,0.15);
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 5;
}

.ticker-label {
  flex-shrink: 0;
  padding: 0 12px;
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 700;
  color: #0a0d0f;
  background: #00ff41;
  height: 100%;
  display: flex;
  align-items: center;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ticker-track {
  flex: 1;
  overflow: hidden;
  height: 100%;
  display: flex;
  align-items: center;
}

.ticker-content {
  display: flex;
  white-space: nowrap;
  animation: data-scroll 30s linear infinite;
  font-family: var(--font-data);
  font-size: 12px;
  gap: 0;
}

.ticker-item {
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ticker-item.critical   { color: #ff0000; }
.ticker-item.high       { color: #ff6b35; }
.ticker-item.medium     { color: #ffd700; }
.ticker-item.low        { color: #00ff41; }
.ticker-item.info       { color: #38bdf8; }

.ticker-separator {
  color: #4b5563;
  padding: 0 4px;
}

/* Estado ALERTA — ticker destella con fondo rojo */
.event-ticker.critical-state {
  border-top-color: rgba(255,0,0,0.6);
  animation: pulse-alert 0.5s ease-in-out infinite;
}
```

---

## 3. Flujos de Usuario

### Flujo 1 — Dashboard Principal (Operador)

```
FLUJO: Operacion Nominal → Deteccion de Alerta
USUARIO: Operador de turno (military analyst, 28-45 años)
OBJETIVO: Detectar, analizar y documentar un evento de alerta en <3 minutos

PANTALLAS:
  1. Dashboard cargado
     Estado: todos los assets ACTIVOS (verde), threat gauge <40%
     Operador: monitoreo pasivo, lectura de ticker

  2. Nuevo evento critico llega via WebSocket
     Ticker: destella 3 veces (pulse-alert) → nuevo item rojo aparece al inicio
     Sidebar: asset afectado cambia a estado ALERTA (borde rojo, parpadeo)
     Mapa: marker del asset muestra ⚠ parpadeante
     ARES: genera notificacion automatica en chat sin interaccion del operador
     → ARES coloca burbuja: "Anomalia detectada. Analizando..."
     → dots de thinking animan 3-8 segundos
     → ARES reemplaza bubble con analisis completo + action buttons

  3. Operador hace clic en asset en sidebar
     → Modal AssetDetail se abre (300ms fade-in)
     → Muestra telemetria en tiempo real, historial, alertas asociadas

  4. Operador clic "ANALIZAR CON ARES" en modal
     → Modal se cierra
     → Chat panel sube al foco
     → ARES analiza con contexto del asset seleccionado
     → Presenta COAs (Cursos de Accion)

  5. Operador selecciona COA-A o COA-B
     → Confirmacion modal simple: "Confirmar seleccion de COA-A"
     → Toast success: "COA registrado en audit trail"
     → PIR list en Intel Panel se actualiza

CASOS EDGE:
  - Sin actividad 5min → screensaver NO: mantener datos vivos
  - Error WebSocket → header status dot cambia a rojo, label "RECONECTANDO..."
  - ARES no responde en 30s → bubble muestra "Error de conexion — Reintentar"
  - Operador cierra modal por accidente → estado no se pierde, asset sigue seleccionado
```

### Flujo 2 — Briefing Estrategico (Comandante)

```
FLUJO: Generacion de Briefing
USUARIO: Comandante / oficial de inteligencia (decision maker)
OBJETIVO: Obtener resumen ejecutivo actualizado del AO en <45 segundos

PANTALLAS:
  1. Intel Panel visible → clic "BRIEFING ESTRATEGICO"
     → Boton entra en estado loading (color gris, texto "GENERANDO...")
     → En ARES chat aparece: "◈ ARES — Generando briefing estrategico..."
     → Dots de thinking animan durante 10-30 segundos

  2. ARES completa generacion
     → Intelligence Product Viewer modal se abre (400ms slide-up)
     → Muestra INTSUM completo con secciones: resumen, indicadores, COAs
     → Badge de clasificacion visible en header del modal
     → Scroll disponible para documento largo

  3. Comandante revisa, descarga o imprime
     → "EXPORTAR PDF" dispara descarga del documento
     → "IMPRIMIR" abre dialogo de impresion del navegador
     → "CERRAR" cierra modal, estado del dashboard no cambia

CASOS EDGE:
  - Timeout 45s sin respuesta → mostrar error en burbuja ARES + reintentar
  - Sin datos suficientes → ARES muestra "Datos insuficientes para briefing confiable"
  - Clasificacion insuficiente → bloquear acceso, mostrar "NIVEL DE ACCESO REQUERIDO: NIVEL-3"
```

### Flujo 3 — Nuevo Incidente Critico (Alerta Automatica)

```
FLUJO: Escalada de Incidente
USUARIO: Sistema (automatico) + Operador pasivo
OBJETIVO: Llamar atencion del operador en <2 segundos

SECUENCIA:
  T+0ms    Evento llega via WebSocket (servidor NATS)
  T+0ms    Asset en sidebar: borde cambia a rojo, animation pulse-alert inicia
  T+50ms   Ticker: item CRITICO aparece al inicio del scroll con prefijo ⚠
  T+50ms   Mapa: marker del asset cambia a ⚠ rojo parpadeante
  T+100ms  Notificacion visual: borde del header destella rojo 1 vez
  T+200ms  ARES envia burbuja automatica en chat con analisis preliminar
  T+500ms  [Opcional] Notificacion de browser (si Notification API permitida)

CASOS EDGE:
  - Multiples alertas simultaneas → ticker muestra todas, sidebar ordena por severidad
  - Alerta falsa positiva → ARES incluye confidence score, operador puede marcar como FP
  - Corte de red durante alerta → ultimo estado conocido persiste, indicador OFFLINE visible
```

---

## 4. Animaciones CSS — Keyframes Completos

```css
/* =====================================================
   SESIS Command Center — Animation Library
   Importar en index.css antes de todos los componentes
   ===================================================== */

/* 1. pulse-alert — alertas criticas, assets en alerta */
@keyframes pulse-alert {
  0%   { opacity: 1;   box-shadow: 0 0 8px rgba(255,0,0,0.6); }
  50%  { opacity: 0.4; box-shadow: 0 0 2px rgba(255,0,0,0.2); }
  100% { opacity: 1;   box-shadow: 0 0 8px rgba(255,0,0,0.6); }
}

/* Version para border-color (no box-shadow) */
@keyframes pulse-alert-border {
  0%   { border-color: rgba(255,0,0,0.8); }
  50%  { border-color: rgba(255,0,0,0.2); }
  100% { border-color: rgba(255,0,0,0.8); }
}

/* 2. rotate-slow — satellites en mapa */
@keyframes rotate-slow {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}

/* 3. scanline — efecto pantalla tactica en header */
@keyframes scanline {
  0%   { left: -60%;  opacity: 0;   }
  10%  { opacity: 1;               }
  90%  { opacity: 1;               }
  100% { left: 110%;  opacity: 0;  }
}

/* 4. glow-green — glow pulsante en elementos activos */
@keyframes glow-green {
  0%   { box-shadow: 0 0 4px rgba(0,255,65,0.3); }
  50%  { box-shadow: 0 0 16px rgba(0,255,65,0.7), 0 0 32px rgba(0,255,65,0.3); }
  100% { box-shadow: 0 0 4px rgba(0,255,65,0.3); }
}

/* Version para text-shadow (datos en tiempo real) */
@keyframes glow-green-text {
  0%   { text-shadow: 0 0 4px rgba(0,255,65,0.3);  }
  50%  { text-shadow: 0 0 12px rgba(0,255,65,0.8); }
  100% { text-shadow: 0 0 4px rgba(0,255,65,0.3);  }
}

/* 5. data-scroll — ticker de eventos horizontal */
@keyframes data-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); } /* -50% porque el contenido se duplica */
}

/* 6. thinking-dots — indicador ARES procesando */
@keyframes thinking-dots {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40%            { transform: scale(1.0); opacity: 1;   }
}

/* 7. degraded-blink — assets en estado DEGRADADO (lento) */
@keyframes degraded-blink {
  0%   { opacity: 1;   border-color: rgba(255,215,0,0.6); }
  50%  { opacity: 0.7; border-color: rgba(255,215,0,0.2); }
  100% { opacity: 1;   border-color: rgba(255,215,0,0.6); }
}

/* 8. fade-in — entrada de modales */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}

/* 9. slide-up — slide de modales desde abajo */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* 10. threat-pulse — gauge cuando nivel > 70% */
@keyframes threat-pulse {
  0%   { filter: brightness(1);   }
  50%  { filter: brightness(1.3); }
  100% { filter: brightness(1);   }
}

/* =====================================================
   Aplicaciones de animacion — clases de utilidad
   ===================================================== */

.animate-pulse-alert   { animation: pulse-alert 0.5s ease-in-out infinite; }
.animate-glow-green    { animation: glow-green 2s ease-in-out infinite; }
.animate-rotate-slow   { animation: rotate-slow 20s linear infinite; }
.animate-degraded      { animation: degraded-blink 2s ease-in-out infinite; }
.animate-fade-in       { animation: fade-in 0.3s ease-out forwards; }
.animate-slide-up      { animation: slide-up 0.4s ease-out forwards; }
```

---

## 5. Accesibilidad

### 5.1 Ratios de Contraste

| Combinacion                              | Ratio  | WCAG AA |
|:---|:---|:---|
| `#00ff41` sobre `#0d1117`               | 13.8:1 | Pasa    |
| `#e0e6ed` sobre `#0d1117`               | 9.2:1  | Pasa    |
| `#e0e6ed` sobre `#1a2332`               | 7.1:1  | Pasa    |
| `#8899a6` sobre `#0d1117`               | 4.6:1  | Pasa (borderline) |
| `#8899a6` sobre `#0f1923`               | 4.5:1  | Pasa (minimo)     |
| `#ffd700` sobre `#0d1117`               | 10.5:1 | Pasa    |
| `#ff0000` sobre `#0d1117`               | 5.2:1  | Pasa    |
| `#0a0d0f` sobre `#00ff41` (btn label)   | 13.8:1 | Pasa    |

Nota: `#4b5563` sobre `#0d1117` da 3.1:1 — usar SOLO para texto decorativo
(timestamps, coordenadas mapa), nunca para informacion critica.

### 5.2 Focus Visible

```css
/* Reset base y focus visible para todos los elementos interactivos */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid #00ff41;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Focus en input de chat */
.chat-input:focus-visible {
  outline: none; /* ya tiene box-shadow personalizado */
  box-shadow: 0 0 0 2px rgba(0,255,65,0.5);
}
```

### 5.3 ARIA y Screen Reader

```html
<!-- Header con status del sistema -->
<header role="banner" aria-label="SESIS Command Center - Estado del sistema">
  <div aria-live="polite" aria-atomic="true" class="system-status">
    <!-- El status se actualiza dinámicamente -->
  </div>
</header>

<!-- Asset list -->
<nav aria-label="Lista de activos tácticos" role="navigation">
  <ul role="list">
    <li role="listitem">
      <button
        aria-pressed="true" <!-- si esta seleccionado -->
        aria-label="Drone Alpha 01, estado activo, bateria 88 por ciento"
      >
        <!-- contenido visual -->
      </button>
    </li>
  </ul>
</nav>

<!-- Mapa táctico -->
<main aria-label="Mapa táctico operacional" role="main">
  <!-- Cada marker SVG -->
  <g role="button" tabindex="0"
     aria-label="Drone Alpha 01, posicion 48.856 Norte 2.352 Este, estado activo">
    <title>DRONE_ALPHA_01 — ACTIVO — 48.856°N / 2.352°E</title>
    <text>▲</text>
  </g>
</main>

<!-- Ticker de eventos -->
<aside
  aria-live="polite"
  aria-label="Feed de eventos tácticos en tiempo real"
  role="log"
  aria-relevant="additions"
>
  <!-- Eventos se añaden por prepend -->
</aside>

<!-- Chat ARES -->
<section aria-label="ARES - Sistema de Razonamiento Estratégico" role="complementary">
  <div
    role="log"
    aria-live="polite"
    aria-relevant="additions text"
    aria-label="Historial de conversacion con ARES"
  >
    <!-- Mensajes -->
  </div>
</section>

<!-- Classification badges — no transmitir SOLO por color -->
<span
  class="classification-badge secret"
  aria-label="Clasificación: SECRETO"
  role="img"
>
  🔴 SECRETO
</span>
```

### 5.4 Teclado

| Accion                          | Tecla            |
|:---|:---|
| Navegar assets en sidebar       | Tab / Shift+Tab  |
| Seleccionar asset               | Enter / Space    |
| Abrir detalle de asset          | Enter            |
| Cerrar modal                    | Escape           |
| Focus en input chat             | Ctrl+L           |
| Enviar mensaje                  | Enter            |
| Navegar tabs en modal           | Tab / Arrow keys |
| Zoom mapa +/-                   | + / -            |
| Centrar mapa en asset seleccionado | Ctrl+G        |

---

## 6. CSS Base — Variables y Reset

```css
/* Pegar al inicio de index.css */

:root {
  /* Backgrounds */
  --bg-base:    #0a0d0f;
  --bg-panel:   #0d1117;
  --bg-card:    #1a2332;
  --bg-sidebar: #0f1923;

  /* Primary */
  --green:        #00ff41;
  --green-dim:    rgba(0,255,65,0.15);
  --green-border: rgba(0,255,65,0.2);
  --green-hover:  rgba(0,255,65,0.6);
  --green-glow:   rgba(0,255,65,0.5);

  /* Severity */
  --critical: #ff0000;
  --high:     #ff6b35;
  --medium:   #ffd700;
  --low:      #00ff41;
  --info:     #38bdf8;

  /* Text */
  --text-primary:   #e0e6ed;
  --text-secondary: #8899a6;
  --text-accent:    #00ff41;
  --text-muted:     #4b5563;

  /* Typography */
  --font-data: 'Courier New', 'Lucida Console', monospace;
  --font-ui:   'Arial Narrow', 'Roboto Condensed', sans-serif;

  /* Layout */
  --header-h:  48px;
  --ticker-h:  36px;
  --sidebar-w: 280px;
  --intel-w:   340px;
  --chat-h:    300px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden; /* el layout controla sus propios scrolls */
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 13px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
}

/* Seleccion de texto con color de marca */
::selection {
  background: rgba(0,255,65,0.25);
  color: #e0e6ed;
}

/* Layout principal */
.app-shell {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar map    intel"
    "sidebar chat   intel"
    "ticker  ticker ticker";
  grid-template-columns: var(--sidebar-w) 1fr var(--intel-w);
  grid-template-rows:
    var(--header-h)
    1fr
    var(--chat-h)
    var(--ticker-h);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
```
