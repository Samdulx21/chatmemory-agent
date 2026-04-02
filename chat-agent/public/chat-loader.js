(function() {
  'use strict';

  // Prevenir múltiples inicializaciones
  if (window.ChatAgent) {
    console.warn('ChatAgent ya está inicializado');
    return;
  }

  // Configuración por defecto
  const DEFAULT_CONFIG = {
    apiKey: '',
    webhookUrl: '',
    position: 'bottom-right',
    primaryColor: '#000000',
    autoOpen: false,
    videoUrl: null,
    selector: null, // Para modo embed
    welcomeMessage: {
      welcome: "¡Hola! Soy tu asistente 🤖",
      text: "asistente virtual.",
      description: "Estoy aquí para ayudarte con lo que necesites."
    },
    quickActions: [
      {
        id: 1,
        text: "¿Cómo puedo mejorar mi método de estudio?",
        action: "metodo_estudio"
      },
      {
        id: 2,
        text: "Necesito ayuda con una tarea de matemáticas.",
        action: "ayuda_matematicas"
      },
      {
        id: 3,
        text: "Quiero aprender sobre un tema nuevo.",
        action: "aprender_nuevo"
      }
    ]
  };

  // Clase principal
  class ChatAgentWidget {
    constructor() {
      this.config = { ...DEFAULT_CONFIG };
      this.isInitialized = false;
      this.container = null;
      this.root = null;
      this.eventHandlers = new Map();
    }

    /**
     * Inicializa el widget
     * @param {Object} userConfig - Configuración del usuario
     */
    init(userConfig = {}) {
      if (this.isInitialized) {
        console.warn('ChatAgent: Ya está inicializado');
        return;
      }

      // Validaciones
      if (!userConfig.apiKey) {
        console.error('ChatAgent: apiKey es requerido');
        return;
      }

      if (!userConfig.webhookUrl) {
        console.error('ChatAgent: webhookUrl es requerido');
        return;
      }

      // Combinar configuración
      this.config = { ...this.config, ...userConfig };

      // Modo embed o floating
      if (this.config.selector) {
        this.initEmbed();
      } else {
        this.initFloating();
      }

      this.isInitialized = true;
      this.trigger('ready');

      console.log('ChatAgent: Inicializado correctamente');
    }

    /**
     * Inicializa el widget en modo floating (burbuja)
     */
    initFloating() {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createContainer());
      } else {
        this.createContainer();
      }
    }

    /**
     * Inicializa el widget en modo embed (dentro de un div específico)
     */
    initEmbed() {
      const targetElement = document.querySelector(this.config.selector);

      if (!targetElement) {
        console.error(`ChatAgent: No se encontró el elemento ${this.config.selector}`);
        return;
      }

      // Para modo embed, forzar autoOpen
      this.config.autoOpen = true;

      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createContainer(targetElement));
      } else {
        this.createContainer(targetElement);
      }
    }

    /**
     * Crea el contenedor del widget
     */
    createContainer(targetElement = null) {
      // Crear el contenedor raíz
      this.container = document.createElement('div');
      this.container.id = 'chatagent-widget-root';

      if (targetElement) {
        // Modo embed
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        targetElement.appendChild(this.container);
      } else {
        // Modo floating
        document.body.appendChild(this.container);
      }

      // Cargar estilos
      this.loadStyles();

      // Renderizar el widget React (se llamará cuando el bundle esté cargado)
      this.render();
    }

    /**
     * Carga los estilos necesarios
     */
    loadStyles() {
      // Estilos base del widget
      const style = document.createElement('style');
      style.id = 'chatagent-custom-styles';
      style.textContent = `
        #chatagent-widget-root {
          position: relative;
          z-index: 999999;
        }

        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        @keyframes slideInFromBottom {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation: slideInFromBottom 0.3s ease-out;
        }
      `;

      if (!document.getElementById('chatagent-custom-styles')) {
        document.head.appendChild(style);
      }
    }

    /**
     * Renderiza el componente React
     */
    render() {
      // Este método será sobrescrito cuando se cargue el bundle de React
      console.log('ChatAgent: Esperando carga del componente React...');
    }

    /**
     * Abre el chat
     */
    open() {
      this.trigger('open');
      // La lógica real será manejada por el componente React
    }

    /**
     * Cierra el chat
     */
    close() {
      this.trigger('close');
      // La lógica real será manejada por el componente React
    }

    /**
     * Envía un mensaje programáticamente
     * @param {string} message - Mensaje a enviar
     */
    sendMessage(message) {
      this.trigger('sendMessage', { message });
    }

    /**
     * Registra un evento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Función manejadora
     */
    on(event, handler) {
      if (!this.eventHandlers.has(event)) {
        this.eventHandlers.set(event, []);
      }
      this.eventHandlers.get(event).push(handler);
    }

    /**
     * Dispara un evento
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos del evento
     */
    trigger(event, data = null) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`ChatAgent: Error en handler de evento ${event}:`, error);
          }
        });
      }
    }

    /**
     * Destruye el widget
     */
    destroy() {
      if (this.root && typeof this.root.unmount === 'function') {
        this.root.unmount();
      }

      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      this.isInitialized = false;
      this.eventHandlers.clear();
      this.trigger('destroy');
    }
  }

  // Exponer la API global
  window.ChatAgent = new ChatAgentWidget();

  // Auto-inicialización si hay configuración inline
  const script = document.currentScript || document.querySelector('script[data-chatagent-config]');
  if (script && script.dataset.chatagentConfig) {
    try {
      const config = JSON.parse(script.dataset.chatagentConfig);
      window.ChatAgent.init(config);
    } catch (error) {
      console.error('ChatAgent: Error parseando configuración inline:', error);
    }
  }

  // Cargar el bundle del componente React
  (function loadWidgetBundle() {
    // Obtener la URL base del script actual
    const scripts = document.getElementsByTagName('script');
    let baseUrl = '';

    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('chat-loader.js')) {
        baseUrl = scripts[i].src.replace(/chat-loader\.js.*$/, '');
        break;
      }
    }

    // Cargar CSS primero
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = baseUrl + 'chat-widget.css';
    link.onload = function() {
      console.log('ChatAgent: Estilos CSS cargados');
    };
    link.onerror = function() {
      console.error('ChatAgent: Error cargando los estilos CSS');
    };
    document.head.appendChild(link);

    // Luego cargar JavaScript
    const script = document.createElement('script');
    script.src = baseUrl + 'chat-widget.js';
    script.async = true;

    script.onload = function() {
      console.log('ChatAgent: Componente React cargado');
    };

    script.onerror = function() {
      console.error('ChatAgent: Error cargando el componente React');
    };

    document.head.appendChild(script);
  })();

})();
