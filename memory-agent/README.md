# Memory Agent — Ferretería El Clavo

Agente de ventas conversacional construido con NestJS, LangChain, Redis y BullMQ. Mantiene el contexto de cada conversación en Redis y persiste los pedidos completados en SQLite.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | NestJS 11 |
| LLM | OpenAI gpt-4o-mini via LangChain |
| Cola de mensajes | BullMQ + ioredis |
| Memoria conversacional | Redis (por sesión, TTL configurable) |
| Persistencia de pedidos | SQLite + TypeORM |

---

## Flujo completo

```
Cliente
  │
  │  POST /api/v1/chat/message
  │  { sessionId: "uuid", message: "Quiero 3 bolsas de cemento" }
  │
  ▼
ChatController
  │
  │  Valida el DTO (sessionId UUID, message no vacío)
  │
  ▼
ChatService
  │
  │  queue.add('chat.message', { sessionId, userMessage })
  │  job.waitUntilFinished(queueEvents, 30s)  ← espera el resultado
  │
  ▼
BullMQ Queue  ──────────────────────────────────────────────┐
                                                            │ procesa el job
                                                            ▼
                                                     ChatProcessor
                                                            │
                                                            ▼
                                                      AgentService
                                                            │
                                          ┌─────────────────┴─────────────────┐
                                          │                                   │
                                          ▼                                   ▼
                                     RedisService                         ChatOpenAI
                                          │                                   │
                              getConversation(sessionId)         invoke(SystemMessage +
                              → historial previo como                historial + HumanMessage)
                                JSON array                                    │
                                          │                                   │
                                          └─────────────────┬─────────────────┘
                                                            │
                                                   respuesta del LLM
                                                   (siempre JSON)
                                                            │
                                          ┌─────────────────┴─────────────────┐
                                          │                                   │
                                   orderComplete: false               orderComplete: true
                                          │                                   │
                              appendMessages(sessionId,          persistOrder() → SQLite
                               [human, ai]) → Redis              deleteConversation() → Redis
                                                                 (limpia la sesión)
                                                            │
                                                            ▼
                                                     job retorna resultado
                                                            │
                                                            ▼
                                                     ChatService
                                                            │
                                                            ▼
                                                     ChatController
                                                            │
                                                            ▼
                                                        Cliente
                                          { sessionId, response, orderComplete, order }
```

---

## Memoria conversacional en Redis

Cada sesión tiene su propia clave en Redis:

```
{REDIS_KEY_PREFIX}conversation:{sessionId}
```

El valor es un array JSON de mensajes:

```json
[
  { "role": "human", "content": "Hola, necesito materiales", "timestamp": 1234567890 },
  { "role": "ai",    "content": "{\"response\": \"...\", ...}", "timestamp": 1234567891 },
  { "role": "human", "content": "Quiero 3 bolsas de cemento", "timestamp": 1234567900 }
]
```

- **TTL**: configurable via `CACHE_TTL` (default: 1800 segundos / 30 minutos)
- **Limpieza automática**: cuando el pedido se completa, la conversación se elimina de Redis

---

## Formato de respuesta del LLM

El agente **siempre** devuelve JSON puro. Nunca texto libre.

### Conversación en curso

```json
{
  "response": "Anotado: 3 bolsas de cemento Portland 50kg. ¿Algo más?",
  "orderComplete": false,
  "order": null
}
```

### Pedido completado

```json
{
  "response": "¡Perfecto! Acá tiene el resumen de su pedido...",
  "orderComplete": true,
  "order": {
    "customerName": "Juan",
    "items": [
      { "product": "Cemento Portland 50kg", "quantity": 3, "unit": "bolsa", "unitPrice": 1200, "subtotal": 3600 },
      { "product": "Arena fina 50kg",       "quantity": 2, "unit": "bolsa", "unitPrice": 400,  "subtotal": 800  }
    ],
    "total": 4400,
    "summary": "3x Cemento Portland ($3.600) + 2x Arena fina ($800) = Total: $4.400"
  }
}
```

Cuando `orderComplete: true`, el agente:
1. Persiste el pedido en SQLite
2. Elimina la conversación de Redis
3. La sesión queda libre para un nuevo pedido

---

## Variables de entorno

```env
PORT=3010
PREFIX=api/v1
NODE_ENV=development

# Redis
REDIS_URL=redis://user:password@host:port
REDIS_KEY_PREFIX=my_prefix_
REDIS_DB=1
REDIS_TLS=false
REDIS_MAX_RETRIES=3
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
REDIS_ENABLE_OFFLINE_QUEUE=true
CACHE_TTL=1800

# OpenAI
API_KEY_OPENAI=sk-...
OPENAI_MODEL=gpt-4o-mini   # opcional, default: gpt-4o-mini
```

---

## API

### `POST /api/v1/chat/message`

Envía un mensaje al agente. Bloquea hasta recibir la respuesta (máx. 30 segundos).

**Body**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Buenas, necesito tornillos y una pala"
}
```

**Response**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "response": "¡Buenas! ¿Qué tipo de tornillos necesita? Tenemos 6x1\" y 8x2\".",
  "orderComplete": false,
  "order": null
}
```

---

## Catálogo de Ferretería El Clavo

| Producto | Precio | Unidad |
|---|---|---|
| Tornillos 6x1" | $50 | caja x100 |
| Tornillos 8x2" | $80 | caja x100 |
| Tuercas M6 | $30 | bolsa x50 |
| Tuercas M8 | $45 | bolsa x50 |
| Pala punta cuadrada | $850 | unidad |
| Pala punta redonda | $780 | unidad |
| Pico estándar | $950 | unidad |
| Cemento Portland 50kg | $1.200 | bolsa |
| Arena fina 50kg | $400 | bolsa |
| Ladrillo hueco 18 huecos | $180 | unidad |
| Caño PVC 4" x 3m | $650 | unidad |
| Llave ajustable 8" | $420 | unidad |
| Destornillador Phillips | $180 | unidad |
| Destornillador plano | $160 | unidad |
| Clavos 2" (500g) | $150 | paquete |

---

## Levantar el proyecto

```bash
pnpm install
pnpm run start:dev
```
