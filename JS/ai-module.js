/**
 * MÓDULO DE IA - GEMINI INTEGRATION
 * Funciones para interactuar con la API de Gemini (Estructura corregida)
 * * ⚠️ ADVERTENCIA: La apiKey NO debe estar visible en el código de frontend.
 * Este código asume un entorno seguro (Node.js/Backend) o un proxy.
 */

const AI = {
    // 🔑 Configuración de la API Key: Reemplaza 'TU_API_KEY_DE_GEMINI_AQUI'
    apiKey: 'AIzaSyCYpydIwRu0Fbwc5ApZ-msTcM2pZWxumlo',
    // 🔗 URL Base de la API de Google (NO debe cambiarse)
    baseUrl: 'https://generativelanguage.googleapis.com',
    // 🤖 Modelo a usar (puedes cambiarlo según tu necesidad)
    modelName: 'gemini-2.5-flash', 

    // Inicializar
    async init() {
        if (this.apiKey === 'TU_API_KEY_DE_GEMINI_AQUI') {
            console.error('❌ ERROR: Por favor, configura tu API Key de Gemini.');
            return false;
        }
        console.log(`✅ Módulo de IA inicializado con modelo: ${this.modelName}`);
        return true;
    },

    // Función genérica y corregida para llamar a Gemini
    async generateContent(prompt, systemInstruction = null) {
        // Construye la URL completa con el modelo y el endpoint
        const fullUrl = `${this.baseUrl}/v1/models/${this.modelName}:generateContent`;

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Incluye la clave API directamente en un encabezado para la autenticación
                    'x-api-key': this.apiKey, 
                },
                body: JSON.stringify({
                    // ✅ Estructura correcta del cuerpo para la API de Gemini
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    config: {
                        // systemInstruction se pasa dentro de 'config' como un objeto
                        ...(systemInstruction && { 
                            systemInstruction: { text: systemInstruction } 
                        }),
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                // Muestra un error más detallado de la API
                throw new Error(error.error.message || 'Error desconocido en la API de Gemini');
            }

            const data = await response.json();

            // ✅ Extracción del texto de la respuesta corregida
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                // Maneja casos donde la respuesta está bloqueada o vacía
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
    
    // ... Puedes copiar el resto de las funciones (analyzeProductivity, enhanceNote, etc.)
    //     y simplemente llamar a 'this.generateContent(prompt, systemInstruction)' 
    //     dentro de ellas, sin necesidad de cambios adicionales.
    
    // Ejemplo de otra función con el ajuste:
    async analyzeProductivity(data) {
        const prompt = `Analiza estos datos de productividad y proporciona 3 insights clave:
        
Datos:
- Tareas completadas esta semana: ${data.completedTasks}
// ... más datos
        
Formato: Texto claro y conciso, máximo 150 palabras.`;
        
        return await this.generateContent(prompt);
    },
    
    // ... resto de las funciones ...
};

// Exportar para uso global
window.AI = AI;

// Ejemplo de cómo usarlo:
// AI.init().then(success => {
//     if (success) {
//         AI.chat("Hola, ¿cuáles son mis tareas para hoy?").then(response => {
//             console.log("Respuesta de IA:", response);
//         }).catch(console.error);
//     }
// });
