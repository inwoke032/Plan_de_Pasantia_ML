/**
 * MÓDULO DE IA - GEMINI INTEGRATION
 * Funciones para interactuar con la API de Gemini (Estructura corregida)
 * * ⚠️ ADVERTENCIA: La apiKey NO debe estar visible en el código de frontend.
 * Se recomienda usar un proxy de backend para proteger la clave.
 */

const AI = {
    // 🔑 Configuración de la API Key: Reemplaza "" por tu clave
    // Utiliza una clave de ejemplo para el entorno de Canvas
    apiKey: "AIzaSyAOe-QlEpmUuFFJkweKu-GX4CCk9f1bg64", 
    // 🔗 URL Base de la API de Google (SOLO la raíz)
    baseUrl: 'https://generativelanguage.googleapis.com', 
    // 🤖 Modelo a usar (versión reciente recomendada)
    modelName: 'gemini-2.5-flash-preview-05-20', 

    // Inicializar
    async init() {
        if (this.apiKey === '') {
            console.warn('⚠️ ADVERTENCIA: El módulo de IA se inicializó sin una clave de API configurada. Las llamadas directas fallarán si la clave no está disponible globalmente.');
        } else {
            console.log(`✅ Módulo de IA inicializado con modelo: ${this.modelName}`);
        }
        return true;
    },

    // Función genérica y corregida para llamar a Gemini
    async generateContent(prompt, systemInstruction = null) {
        // ✅ CORRECCIÓN CLAVE: Construye la URL base del endpoint
        let fullUrl = `${this.baseUrl}/v1beta/models/${this.modelName}:generateContent`;

        // Solo agrega la clave si está presente. Si es "", la omite, y el entorno
        // de Canvas se encarga de inyectar la clave y manejar CORS.
        if (this.apiKey) {
            fullUrl += `?key=${this.apiKey}`;
        }
        
        // Si la clave no está configurada, salta un error (o usa un mecanismo de entorno)
        if (!this.apiKey && typeof window.__initial_auth_token === 'undefined') {
            console.error("No se encontró la clave de API.");
            throw new Error('Error de autenticación. Verifica tu API key de Gemini.');
        }

        try {
            // Construimos el cuerpo de la petición de forma limpia
            const bodyPayload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            };
            
            // ✅ NUEVA CORRECCIÓN: Usar 'generationConfig' para 'systemInstruction'.
            // Esta es la estructura más robusta para el endpoint REST.
            if (systemInstruction) {
                bodyPayload.generationConfig = {
                    systemInstruction: systemInstruction
                };
            }

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyPayload) // Usamos el payload construido
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = response.statusText;
                try {
                    // Intenta parsear el JSON de error para obtener el mensaje detallado
                    const errorJson = JSON.parse(errorText);
                    // Esto capturará el mensaje como "Invalid JSON payload received."
                    errorMessage = errorJson.error?.message || response.statusText; 
                } catch (e) {
                    // Si no es JSON, usa el texto crudo
                    errorMessage = errorText;
                }
                // Muestra el código de estado para ayudar a la depuración (403, 401, 400)
                throw new Error(`[Status ${response.status}] ${errorMessage}`);
            }

            const data = await response.json();

            // ✅ Extracción del texto de la respuesta corregida
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                if (data.promptFeedback && data.promptFeedback.blockReason) {
                    throw new Error(`Respuesta bloqueada. Motivo: ${data.promptFeedback.blockReason}`);
                }
                throw new Error('Respuesta inválida o vacía de Gemini');
            }
            
            return data.candidates[0].content.parts[0].text;
            
        } catch (error) {
            console.error('Error al llamar a Gemini:', error);
            throw error;
        }
    },

    // --- Funciones que usan generateContent ---

    // Chat simple con contexto (usa la nueva función)
    async chat(message, context = []) {
        const systemPrompt = `Eres un asistente inteligente de productividad personal. 
Ayudas al usuario con su plan de pasantía en ML, gestión de tareas, hábitos y organización.
Sé conciso, útil y motivador.`;
        
        // El manejo del contexto es simplificado para este ejemplo
        let fullPrompt = message;
        if (context.length > 0) {
            fullPrompt = `Contexto de conversación anterior:\n${context.join('\n')}\n\nUsuario: ${message}`;
        }
        
        return await this.generateContent(fullPrompt, systemPrompt);
    },
    
    // Generar tareas inteligentes basadas en metas (utiliza manejo de JSON)
    async generateTasks(goal, context = {}) {
        const prompt = `Genera 3-5 tareas específicas y accionables para lograr esta meta: "${goal}"
        
Contexto del usuario:
- Área: Pasantía en Inteligencia Artificial
- Tareas actuales: ${context.currentTasks || 0}
- Nivel: ${context.level || 'Intermedio'}

Devuelve SOLO un array JSON con este formato exacto:
[
    {
        "title": "Título corto de la tarea",
        "description": "Descripción detallada",
        "priority": "high|medium|low",
        "tags": ["tag1", "tag2"]
    }
]

Responde únicamente con el JSON, sin texto adicional.`;
        
        const response = await this.generateContent(prompt);
        try {
            // Intenta encontrar y parsear el bloque JSON
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // Intenta parsear directamente si no hay texto extra
            return JSON.parse(response.trim()); 
        } catch (error) {
            console.error('Error parseando tareas generadas:', error);
            // Devuelve la respuesta cruda para depuración si falla el parseo
            console.log('Respuesta cruda que falló el parseo:', response); 
            return [];
        }
    },
    
    // Analizar productividad y dar insights
    async analyzeProductivity(data) {
        const prompt = `Analiza estos datos de productividad y proporciona 3 insights clave:
        
Datos:
- Tareas completadas esta semana: ${data.completedTasks}
- Tareas pendientes: ${data.pendingTasks}
- Sesiones Pomodoro: ${data.pomodoroSessions}
- Racha de hábitos: ${data.habitStreak} días
- Horas de estudio estimadas: ${data.studyHours}

Proporciona:
1. Un análisis breve del rendimiento
2. Una recomendación específica para mejorar
3. Un mensaje motivacional personalizado

Formato: Texto claro y conciso, máximo 150 palabras.`;
        
        return await this.generateContent(prompt);
    },
    
    // Mejorar/completar notas
    async enhanceNote(noteContent, action = 'improve') {
        let prompt = '';
        
        switch (action) {
            case 'improve':
                prompt = `Mejora esta nota manteniendo el contenido principal pero haciéndola más clara y estructurada:\n\n${noteContent}`;
                break;
            case 'summarize':
                prompt = `Crea un resumen conciso de esta nota (máximo 100 palabras):\n\n${noteContent}`;
                break;
            case 'expand':
                prompt = `Expande esta nota agregando detalles relevantes y ejemplos:\n\n${noteContent}`;
                break;
            case 'bullets':
                prompt = `Convierte esta nota en puntos clave (bullets):\n\n${noteContent}`;
                break;
        }
        
        return await this.generateContent(prompt);
    },
    
    // Sugerir hábitos basados en objetivos
    async suggestHabits(goals, currentHabits = []) {
        const prompt = `Sugiere 3 hábitos diarios para alguien que quiere: ${goals}

Hábitos actuales: ${currentHabits.join(', ') || 'Ninguno'}

Devuelve SOLO un array JSON:
[
    {
        "name": "Nombre del hábito",
        "description": "Por qué es importante",
        "icon": "code|book|exercise|meditation|water|study"
    }
]

Responde únicamente con el JSON, sin texto adicional.`;
        
        const response = await this.generateContent(prompt);
        try {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(response.trim()); 
        } catch (error) {
            console.error('Error parseando hábitos sugeridos:', error);
            console.log('Respuesta cruda que falló el parseo:', response); 
            return [];
        }
    },
    
    // Crear plan de estudio personalizado
    async createStudyPlan(topic, duration, level) {
        const prompt = `Crea un plan de estudio estructurado para:
Tema: ${topic}
Duración: ${duration}
Nivel: ${level}

Proporciona un plan con fases, objetivos y recursos recomendados.
Máximo 300 palabras, bien estructurado con bullets o números.`;
        
        return await this.generateContent(prompt);
    },
    
    // Generar resumen diario/semanal
    async generateSummary(periodData) {
        const prompt = `Genera un resumen motivador de este período:

Logros:
- Tareas completadas: ${periodData.tasksCompleted}
- Hábitos cumplidos: ${periodData.habitsCompleted}
- Sesiones de enfoque: ${periodData.focusSessions}
- Notas creadas: ${periodData.notesCreated}

Proporciona:
1. Resumen de logros (50 palabras)
2. Estadística destacada
3. Mensaje motivacional para la próxima semana

Formato claro y positivo.`;
        
        return await this.generateContent(prompt);
    },
    
    // Responder preguntas sobre recursos de IA/ML
    async answerQuestion(question) {
        const systemPrompt = `Eres un experto en Inteligencia Artificial y Machine Learning.
Responde preguntas de forma clara, educativa y práctica.
Si la pregunta no es sobre IA/ML, indica que estás especializado en esos temas.`;
        
        return await this.generateContent(question, systemPrompt);
    }
};

// Exportar para uso global
window.AI = AI;
