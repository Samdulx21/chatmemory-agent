# Documentación Global: ChatAgent System 🤖

Este ecosistema se compone de un **Frontend (ChatAgent Widget)** y un **Backend (Memory-Agent)** basado en NestJS y Redis. Juntos forman un asistente inteligente con memoria persistente por sesión y procesamiento asíncrono.

---

## 🏗️ Arquitectura del Sistema

### 1. Frontend: ChatAgent Widget (`/chat-agent`)
Es un widget embebible desarrollado en **React + Vite + TailwindCSS**.
- **Loader (`chat-loader.js`):** Script liviano que se inyecta en cualquier sitio web. Gestiona la configuración inicial, inyecta los estilos y carga el bundle de React de forma diferida.
- **Componente Principal (`Chat.tsx`):** Interfaz de usuario que gestiona el estado de los mensajes, el indicador de escritura y la comunicación con la API.
- **Identidad de Sesión:** Genera un `sessionId` único que se guarda en el `sessionStorage`. Esto permite que el usuario no pierda el hilo de la conversación si refresca la página (mientras no cierre la pestaña).

### 2. Backend: Memory-Agent (`/memory-agent`)
Servidor robusto en **NestJS** que orquesta la lógica del agente.
- **Controlador de Chat:** Recibe las peticiones, valida el `X-VERIFY-TOKEN` y las envía al servicio de procesamiento.
- **Procesador de Colas (BullMQ + Redis):** Cada mensaje entrante se encola en Redis. Esto evita saturar las APIs de IA y permite manejar picos de tráfico de forma eficiente.
- **Agente de IA (OpenAI/Gemini):** Utiliza los prompts definidos en `src/agent/prompts/` para dar personalidad al bot (actualmente configurado como Alan Brito de la Ferretería El Clavo).

---

## 🧠 Funcionamiento de la Memoria y Encolado

### 🔄 El Flujo de un Mensaje
1. El usuario envía un mensaje desde el widget.
2. El mensaje llega al endpoint `/api/v1/chat/message`.
3. El backend valida la seguridad y **mete el mensaje en una cola de Redis**.
4. Un "Worker" (procesador) toma el mensaje de la cola apenas tiene capacidad.
5. El Worker recupera la **memoria histórica** de ese `sessionId` desde Redis.
6. Se envía el prompt del sistema + historia + nuevo mensaje a la IA.
7. La IA responde en formato JSON.
8. El backend guarda la nueva interacción en Redis y devuelve la respuesta al frontend.

### ⏱️ Persistencia y Memoria
- **¿Cuánto dura la memoria?** La memoria del agente está ligada al `CACHE_TTL` definido en el `.env` (por defecto 1800 segundos o 30 minutos). Si no hay actividad en ese tiempo, la sesión "expira" en el servidor para ahorrar recursos.
- **Aislamiento:** Cada `sessionId` es un silo independiente. Alan Brito no mezclará los pedidos de un cliente con los de otro.
- **Contexto de IA:** El sistema envía las últimas interacciones para que el bot tenga "memoria de corto plazo".

---

## 🛠️ Configuración de Variables de Entorno (`.env`)

Para que el backend funcione, debés configurar los siguientes valores (basados en `.env.example`):

- **`PORT`:** Puerto donde corre el servidor (ej: 3010).
- **`TRUSTED_ORIGINS`:** Dominios permitidos para conectar al widget (CORS).
- **`API_KEY_OPENAI` / `API_KEY_GENAI`:** Claves para usar los modelos de lenguaje.
- **`REDIS_URL`:** Conexión a tu instancia de Redis (necesaria para las colas y la memoria).
- **`REDIS_DB`:** El índice de la base de datos en Redis (0 a 15). Usar una distinta para desarrollo/producción.
- **`X_VERIFY_TOKEN`:** Token de seguridad que el frontend debe enviar en los headers para que el backend acepte la petición.

---

## 🚀 Cómo Empezar

### Backend
```bash
cd memory-agent
cp .env.example .env  # Y completa tus datos reales
pnpm install
pnpm start:dev
```

### Frontend
```bash
cd chat-agent
pnpm install
pnpm build:widget
# Sube los archivos de /dist/widget a tu servidor
```

---
© 2026 ChatAgent Project - Sistema de Asistencia Inteligente con NestJS
