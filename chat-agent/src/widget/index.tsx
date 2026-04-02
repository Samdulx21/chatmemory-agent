import React from 'react'
import { createRoot } from 'react-dom/client'
import Chat from '../App/Chat'
import '../index.css'

declare global {
  interface Window {
    ChatWidget: ChatWidgetInstance
    React: typeof React
  }
}

interface ChatWidgetInstance {
  init: (container: HTMLElement) => void
  destroy: () => void
  container: HTMLElement | null
  isInitialized: boolean
  root?: any
  render?: () => void
}

function renderWidget(container: HTMLElement) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <Chat />
    </React.StrictMode>
  )
  return root
}

if (window.ChatWidget) {
  window.ChatWidget.render = function () {
    if (!this.container) return
    try {
      this.root = renderWidget(this.container)
    } catch (error) {
      console.error('ChatWidget: Error rendering:', error)
    }
  }

  if (window.ChatWidget.isInitialized && window.ChatWidget.container) {
    window.ChatWidget.render()
  }
}

window.React = React

export { Chat }
