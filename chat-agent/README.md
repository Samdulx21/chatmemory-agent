# EduChat Widget

Widget de chat embebible educativo que puede ser integrado en cualquier sitio web mediante CDN.

## 🚀 Instalación Rápida

Copia este código antes de cerrar la etiqueta `</body>` de tu sitio:

```html
<!-- Cargar el loader del widget -->
<script src="https://tu-cdn.com/chat-loader.js"></script>

<script>
    // Inicializar cuando el DOM esté listo
    window.EduChat.on('ready', function() {
        window.EduChat.init({
            apiKey: 'tu-api-key',
            webhookUrl: 'https://tu-backend.com/api/chat',
            position: 'bottom-right',
            primaryColor: '#2563eb'
        });
    });
</script>
```

## 🛠️ Desarrollo Local

1. Instalar dependencias:
```bash
pnpm install
```

2. Iniciar servidor de desarrollo:
```bash
pnpm dev
```

3. Para probar el widget embebido, abre `debug-widget.html` en tu navegador.

## 📦 Construcción del Widget (Build)

Para generar los archivos finales que se subirán al CDN:

```bash
pnpm build:widget
```

Esto generará en la carpeta `dist/widget/`:
- `chat-loader.js` (Cópialo manualmente de `public/chat-loader.js`)
- `chat-widget.js` - El bundle principal
- `chat-widget.css` - Los estilos necesarios

### Estructura de archivos generada:
- ✅ `chat-loader.js`
- ✅ `chat-widget.js`

## ⚙️ Configuración (API)

| Propiedad | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `apiKey` | string | ✅ | - | Tu API key del asistente |
| `webhookUrl` | string | ✅ | - | URL de tu backend |
| `position` | string | ❌ | `bottom-right` | `bottom-right` o `bottom-left` |
| `primaryColor` | string | ❌ | `#2563eb` | Color principal en formato HEX |
| `autoOpen` | boolean | ❌ | `false` | Abre el chat automáticamente al cargar |
| `selector` | string | ❌ | - | Selector CSS para modo embed |

## 🕹️ Control Programático

```javascript
// Abrir el chat
window.EduChat.open();

// Cerrar el chat
window.EduChat.close();

// Enviar un mensaje
window.EduChat.sendMessage("Hola, necesito ayuda con matemáticas");

// Escuchar eventos
window.EduChat.on('ready', () => { ... });
window.EduChat.on('open', () => { ... });
window.EduChat.on('close', () => { ... });
```

## 📝 Personalización de la UI

- Edita `src/App/Chat.tsx` para cambiar la interfaz del chat.
- Los estilos base se manejan con Tailwind CSS.

---
© 2026 EduChat - Asistente Educativo
