# 🛡️ SESIS: Sistema de Inteligencia y Conciencia Situacional Soberana

> **⚠️ AVISO LEGAL CRÍTICO:** Este software es **PROPIEDAD PRIVADA EXCLUSIVA**. Desarrollado específicamente para Fuerzas Armadas y Agencias de Inteligencia. Su clonación, difusión, ingeniería inversa o uso no autorizado será perseguido mediante **ACCIONES JUDICIALES PENALES Y CIVILES** bajo las leyes de propiedad intelectual y seguridad nacional.

---

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Deployment-success?style=for-the-badge&logo=shield" alt="Status">
  <img src="https://img.shields.io/badge/Security-Zero%20Trust-red?style=for-the-badge&logo=lock" alt="Zero Trust">
  <img src="https://img.shields.io/badge/AI-Ares%20Cognitive%20Engine-blue?style=for-the-badge&logo=openai" alt="AI Agent">
  <img src="https://img.shields.io/badge/Architecture-Event%20Driven-purple?style=for-the-badge&logo=apachekafka" alt="Architecture">
</p>

## 🛰️ Visión General y Nuevas Capacidades

**SESIS** (Soberano UE, Coalition-ready, Defensivo) es una plataforma multi-agente militar de nueva generación diseñada para el dominio de la información en teatros de operaciones multidominio. 

Con los últimos avances, se ha implementado la orquestación avanzada de activos combinada con modelos de IA generativa (Ollama/AresChat), módulos de fusión de inteligencia (Intel Fusion) e interfaces tácticas completas en React.

### 💎 Pilares Cognitivos
- **Ares LLM (Military Brain)**: Agente de IA para evaluación de amenazas y orquestación de la interfaz de mando y control (C2).
- **Intel Fusion Engine**: Componente de backend para la amalgama de información multi-sensor, correlacionando telemetría de activos y datos OSINT en tiempo real.
- **Visualización Táctica (Vite+React)**: Dashboard reactivo, mapas tácticos asíncronos y sistema unificado de tickers de inteligencia crítica.
- **Control Vectorial de Anomalías**: Worker integrado de ML que audita continuamente el histórico C3I (Command, Control, Communications, and Intelligence).

---

## 🗺️ Mapa Simulado: Orquestación de Activos Tácticos en el Campo

El siguiente diagrama representa de manera técnica e interactiva cómo SESIS coordina a los distintos activos heterogéneos desplegados en un teatro operativo asimétrico, y cómo la información viaja de regreso al núcleo de inteligencia (Ares).

```mermaid
flowchart TD
    %% Estilos Globales
    classDef C2 fill:#111827,stroke:#3b82f6,stroke-width:3px,color:#fff;
    classDef drone fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef squad fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff;
    classDef sat fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#fff;
    classDef ai fill:#312e81,stroke:#8b5cf6,stroke-width:2px,color:#fff;

    %% Nodos Core
    C2Centro["🛡️ SESIS Command and Control<br/>Cerebro Militar (Ares)"]:::C2
    
    %% Teatro de Operaciones
    subgraph Teatro_de_Operaciones["🎯 Teatro de Operaciones Táctico"]
        direction LR
        SQUAD_A["🐺 Foxtrot Unit<br/>(Incursión Táctica)"]:::squad
        UAV_1[("🛩️ MQ-9 Reaper<br/>(SIGINT / ISTAR)")]:::drone
        UAV_2[("🚁 Swarm Drones<br/>(Vigilancia Perimetral)")]:::drone
        SAT_1["🛰️ Satélite Óptico<br/>(Cobertura GEO)"]:::sat
    end

    %% Edge
    subgraph Edge_Processing["⚡ Borde / Edge"]
        EDGE_AI["🧠 Nodo Edge AI<br/>Filtrado y Detección Temprana"]:::ai
    end

    %% Enlaces Sensoriales
    UAV_1 -- "Video Feed / Radar" --> EDGE_AI
    UAV_2 -- "Telemetría Térmica" --> EDGE_AI
    SQUAD_A -. "Señales Biométricas" .-> EDGE_AI
    SAT_1 -- "Imágenes Alta Res." --> EDGE_AI
    
    EDGE_AI == "Fusión de Sensores (UEE/mTLS)" === C2Centro
    
    %% Enlaces de Comando (C2)
    C2Centro == "Órdenes / Waypoints" ===> UAV_1
    C2Centro == "Coordenadas de Extracción" ===> SQUAD_A
```

---

## 📊 Arquitectura del Sistema End-to-End

```mermaid
flowchart TB
    subgraph Frontendui["Interfaz Táctica de Mando (Frontend UI)"]
        DASH["🖥️ React Dashboard"]
        MAP["🗺️ Geo-Tactical Map"]
        CHAT["💬 Ares AI Chat"]
        DASH --- MAP & CHAT
    end
    
    subgraph Backendpy["Core Militar (Backend Python)"]
        API["⚡ API Gateway Router"]
        FUSION["🧩 Intel Fusion Engine"]
        ARES_BRAIN["🧠 Military Brain (Ares LLM)"]
        
        API --- FUSION & ARES_BRAIN
    end
    
    subgraph Memoriaybase["Memoria y Base de Inteligencia"]
        BUS(("🚀 NATS JetStream"))
        ML["⚙️ ML Worker (Cálculo de Amenazas)"]
        PG[("🐘 PostGIS DB")]
    end
    
    DASH <-->|WebSocket / REST| API
    FUSION -->|Publicación de Eventos| BUS
    BUS <-->|Detección de Anomalías| ML
    ML -->|Persistencia Histórica| PG
    ARES_BRAIN -->|Consultas Semánticas| PG
    
    style DASH fill:#1f2937,stroke:#3b82f6,color:#e5e7eb
    style MAP fill:#1f2937,stroke:#3b82f6,color:#e5e7eb
    style CHAT fill:#1f2937,stroke:#3b82f6,color:#e5e7eb
    style API fill:#111827,stroke:#10b981,color:#fff
    style ARES_BRAIN fill:#4c1d95,stroke:#8b5cf6,color:#e5e7eb
    style ML fill:#7c2d12,stroke:#f97316,color:#fff
```

---

## 🛠️ Stack Tecnológico Actualizado

| Módulo | Tecnología Implementada | Propósito Crítico |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, CSS Grid puro | Renderización inmediata. Bajo consumo y ultra respuesta. |
| **Backend Core** | Python, FastAPI, Motor Asíncrono | Toma de decisiones y enrutamiento con latencia inferior a 30ms. |
| **IA & Cerebro** | Ollama (Local LLM), ML Workers | "Ares", análisis predictivo totalmente *air-gapped* sin conexión externa. |
| **Ingesta Sensorial**| Protocolo UEE, NATS JetStream | Resiliencia garantizada en zonas de negación electrónica. |
| **Almacenamiento** | PostGIS & TimescaleDB | Memoria táctico-espacial a prueba de desconexiones. |

---

## 🚀 Despliegue Rápido (Entorno de Comando)

SESIS sigue operando basado en contenedores para infraestructura *bare-metal* desconectada de la red pública.

```bash
# 1. Asegurar el aprovisionamiento de modelos LLM tácticos
./scripts/init_ollama.sh

# 2. Desplegar el stack completo de fusión e interfaz táctica
docker-compose up -d --build
```

### Rutas Activas del Centro de Comando:
- **Dashboard Táctico (React UI)**: `http://localhost (Port 80/3000)`
- **Ares API / Core**: `http://localhost:8000/docs`
- **NATS Intelligence Bus**: `Port 4222`
- **Almacén Táctico (PostgreSQL)**: `Port 5432`

---

## 🔒 Postura de Seguridad e Inmutabilidad

Cada evento en la plataforma (movimientos de unidades, alertas procesadas, proyecciones de riesgo generadas por IA) forma parte de una **Matriz de Cripto-Auditoría**. Los *workers* analizan los datos bajo un esquema **Zero-Trust** asegurando que la información de fusión de inteligencia nunca sea manipulada ni corrompida.

---

© 2026. Todos los derechos reservados por el Autor. **Clasificación: CONFIDENCIAL MAJESTIC / NOFORN**.
