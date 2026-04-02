import { useState, useRef, useEffect, useCallback } from 'react'
import { Send } from 'lucide-react'
import { generateSessionId } from '../utils/session-utils'

const API_URL = 'http://localhost:3010/api/v1/chat/message'

// --- Types ---

interface OrderItem {
  product: string
  quantity: number
  unit: string
  unitPrice?: number
  subtotal?: number
}

interface AgentOrder {
  customerName: string | null
  items: OrderItem[]
  total: number
  summary: string
}

interface AgentResponse {
  sessionId: string
  response: string
  orderComplete: boolean
  order: AgentOrder | null
}

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  order?: AgentOrder | null
}

// --- Components ---

function OrderSummary({ order }: { order: AgentOrder }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs font-semibold text-green-600 mb-2">✓ Pedido confirmado</p>
      <div className="space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs text-gray-600">
            <span>{item.quantity}× {item.product}</span>
            {item.subtotal != null && (
              <span className="font-medium">${item.subtotal.toLocaleString('es-AR')}</span>
            )}
          </div>
        ))}
      </div>
      {order.total > 0 && (
        <div className="flex justify-between text-sm font-semibold text-gray-900 mt-2 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${order.total.toLocaleString('es-AR')}</span>
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! Soy Allan Brito Delgado. Asistente de ventas, ¿en qué puedo ayudarte hoy?',
      sender: 'bot',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState<string>(() => {
    const stored = sessionStorage.getItem('educhat-session')
    if (stored) return stored
    const id = generateSessionId()
    sessionStorage.setItem('educhat-session', id)
    return id
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user' }])
    setIsLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: AgentResponse = await res.json()

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: data.response,
          sender: 'bot',
          order: data.orderComplete ? data.order : null,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: 'No pude conectarme. Verificá que el servidor esté corriendo e intentá de nuevo.',
          sender: 'bot',
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          AE
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Allan Brito Bot</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-xs text-gray-400">En línea</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${msg.sender === 'user'
                  ? 'bg-gray-900 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.order && <OrderSummary order={msg.order} />}
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
        <div
          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
            focus-within:border-gray-400 focus-within:bg-white transition-colors"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu mensaje..."
            disabled={isLoading}
            autoFocus
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center
              disabled:opacity-30 hover:bg-gray-700 active:scale-95 transition-all shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

    </div>
  )
}
