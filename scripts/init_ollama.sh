#!/bin/sh
# =============================================================================
# SESIS — Inicialización del modelo ARES en Ollama
# Se ejecuta una sola vez al arrancar el stack por primera vez
# =============================================================================

OLLAMA_URL="${OLLAMA_URL:-http://ollama:11434}"
MODEL="${OLLAMA_MODEL:-mistral:7b}"

echo "[ARES INIT] Esperando a que Ollama esté disponible en ${OLLAMA_URL}..."

# Esperar hasta que Ollama responda
MAX_WAIT=120
ELAPSED=0
until curl -sf "${OLLAMA_URL}/api/tags" > /dev/null 2>&1; do
    if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
        echo "[ARES INIT] ERROR: Ollama no respondió tras ${MAX_WAIT}s. Abortando."
        exit 1
    fi
    echo "[ARES INIT] Ollama no disponible aún. Reintentando en 5s... (${ELAPSED}s/${MAX_WAIT}s)"
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

echo "[ARES INIT] Ollama disponible. Descargando modelo base: ${MODEL}"

# Pull del modelo base
curl -s -X POST "${OLLAMA_URL}/api/pull" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"${MODEL}\"}" | \
    while IFS= read -r line; do
        echo "[ARES PULL] $line"
    done

echo "[ARES INIT] Modelo ${MODEL} listo."

# Crear el Modelfile personalizado ARES
MODELFILE="FROM ${MODEL}

SYSTEM \"\"\"You are ARES (Adaptive Reasoning for Emergent Situations), a classified military AI assistant operating under the authority of the Ministry of Defense. You are an expert in:

- Military strategy and doctrine (NATO, joint operations, combined arms)
- Tactical and operational planning (Mission Analysis, Course of Action development)
- Intelligence analysis (HUMINT, SIGINT, IMINT, OSINT, CYBER INT fusion)
- Threat assessment and targeting
- Command and Control (C2) operations
- Information warfare and electronic warfare
- Logistics and sustainment planning
- Crisis management and escalation control

Your responses are precise, structured, and classified. Always structure responses in military format using NATO terminology. Mark each section with its classification level [UNCLASSIFIED], [CONFIDENTIAL], or [SECRET].\"\"\"

PARAMETER temperature 0.2
PARAMETER num_predict 2048
PARAMETER stop \"<|end|>\"
PARAMETER stop \"</s>\""

echo "[ARES INIT] Creando modelo personalizado 'ares'..."

# Crear el modelo ARES personalizado vía API
curl -s -X POST "${OLLAMA_URL}/api/create" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"ares\", \"modelfile\": $(echo "$MODELFILE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}" | \
    while IFS= read -r line; do
        echo "[ARES CREATE] $line"
    done

echo "[ARES INIT] Modelo ARES listo. Sistema operativo."
echo "[ARES INIT] URL: ${OLLAMA_URL} | Modelos: ${MODEL}, ares"
