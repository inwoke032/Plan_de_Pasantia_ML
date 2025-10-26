# Plan de Pasantía IA - Centro de Productividad Personal

Aplicación web interactiva completa para gestionar tu plan de pasantía en Inteligencia Artificial con sistema de tareas, notas, hábitos, calendario, análisis de productividad y asistente IA.

## 🚀 Características Principales

### ✅ Implementado

1. **Sistema de Autenticación Completo**
   - Registro de usuarios con validación CAPTCHA (hCaptcha)
   - Inicio de sesión seguro con Supabase Auth
   - Gestión de sesiones
   - Cierre de sesión

2. **Gestión de API Key de Gemini**
   - Modal de configuración para ingresar la API Key
   - Almacenamiento seguro en Supabase
   - Validación y prueba de conexión
   - Sin API keys hardcodeadas en el código

3. **Chat IA Funcional**
   - Asistente de productividad con IA
   - Historial de conversación
   - Contexto de mensajes previos
   - Sugerencias rápidas

4. **Diseño Responsivo Completo**
   - Optimizado para dispositivos móviles (Android)
   - Navegación adaptativa
   - Botones y elementos táctiles accesibles
   - Layouts fluidos para todas las pantallas

5. **Progressive Web App (PWA)**
   - Manifest.json configurado
   - Service Worker para funcionamiento offline
   - Instalable en dispositivos Android
   - Iconos para todas las resoluciones
   - Botón de instalación automático

6. **Funcionalidades de Productividad**
   - Dashboard con estadísticas
   - Gestión de tareas con drag-and-drop
   - Editor de notas con Markdown
   - Tracker de hábitos
   - Calendario de eventos
   - Roadmap de estudio en IA
   - Biblioteca de recursos
   - Análisis de productividad
   - Temporizador Pomodoro

## 🔧 Configuración

### Requisitos Previos

- Base de datos Supabase (ya configurada)
- API Key de Google Gemini ([Obtener aquí](https://makersuite.google.com/app/apikey))

### Instalación

1. La aplicación está lista para usar
2. Abre `auth.html` en tu navegador
3. Crea una cuenta nueva (requiere CAPTCHA)
4. Inicia sesión

### Configurar API Key de Gemini

1. Una vez dentro de la aplicación, haz clic en el botón de Configuración (⚙️)
2. Ingresa tu API Key de Google Gemini
3. Haz clic en "Guardar Configuración"
4. Opcionalmente, prueba la conexión con el botón "Probar Conexión"

## 📱 Instalación como PWA en Android

1. Abre la aplicación en Chrome o Firefox
2. Cuando aparezca el botón "Instalar App", haz clic
3. Confirma la instalación
4. La app aparecerá en tu pantalla de inicio como una aplicación nativa

## 🔐 Seguridad

- **Autenticación**: Supabase Auth con email/password
- **CAPTCHA**: Protección contra bots en el registro
- **API Keys**: Almacenadas de forma segura en la base de datos
- **RLS**: Row Level Security en Supabase para proteger datos de usuarios
- **Sin localStorage**: No se usa localStorage ni sessionStorage

## 📂 Estructura del Proyecto

```
project/
├── index.html              # Aplicación principal
├── auth.html              # Página de autenticación
├── manifest.json          # Configuración PWA
├── service-worker.js      # Service Worker para offline
├── CSS/
│   ├── style.css         # Estilos principales
│   └── auth.css          # Estilos de autenticación
├── JS/
│   ├── script.js         # Lógica principal
│   ├── auth.js           # Lógica de autenticación
│   ├── ai-module.js      # Módulo de IA (Gemini)
│   ├── ai-chat.js        # Chat con IA
│   ├── app-init.js       # Inicialización de la app
│   ├── supabase-client.js # Cliente de Supabase
│   └── pwa-installer.js  # Instalador PWA
└── assets/
    └── images/           # Logos e iconos PWA
```

## 🎨 Diseño

- **Paleta de colores**: Tierra Suave (sin violetas ni morados)
- **Tipografía**: Inter para UI, Fira Code para código
- **Modo oscuro**: Incluido y totalmente funcional
- **Responsive**: Optimizado para móviles, tablets y desktop

## 🌐 Base de Datos

### Tablas

- `auth.users` - Usuarios (gestionado por Supabase Auth)
- `user_config` - Configuración de usuarios (API keys)

### Políticas RLS

- Los usuarios solo pueden ver y editar su propia configuración
- Autenticación requerida para todas las operaciones

## 🔄 Flujo de Uso

1. **Primera vez**:
   - Registro → CAPTCHA → Login → Configurar API Key → Usar la app

2. **Usuarios existentes**:
   - Login → Usar la app

3. **Sin API Key configurada**:
   - Las funciones de IA mostrarán un mensaje pidiendo configurar la API Key

## 🐛 Solución de Problemas

### El chat de IA no funciona
- Verifica que hayas configurado tu API Key en Configuración
- Usa el botón "Probar Conexión" para validar la key
- Asegúrate de que la API Key comience con "AIzaSy"

### No puedo registrarme
- Completa el CAPTCHA
- Verifica que las contraseñas coincidan
- Asegúrate de usar un email válido

### La PWA no se instala
- Usa Chrome o Firefox en Android
- Verifica que tengas conexión a internet
- Intenta refrescar la página

## 📝 Notas Técnicas

- **Sin Build Process**: La aplicación es completamente estática
- **CDN**: Usa CDNs para librerías (Chart.js, Font Awesome, Supabase)
- **Offline**: Funciona offline después de la primera carga (PWA)
- **Modern JavaScript**: ES6+ con async/await

## 🎯 Próximas Mejoras Sugeridas

- Sincronización automática de datos
- Notificaciones push
- Compartir tareas entre usuarios
- Temas personalizables
- Exportación/importación de datos
- Integración con calendarios externos

## 📄 Licencia

Este proyecto es de código abierto.

## 🙏 Créditos

- **Gemini AI** por Google
- **Supabase** para backend
- **Font Awesome** para iconos
- **Chart.js** para gráficas
