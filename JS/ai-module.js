// MÓDULO DE IA - GEMINI INTEGRATION (AJUSTADO)
const AI = {
    // ⚠️ ATENCIÓN: Solo llama directamente si estás en un BACKEND SEGURO. ....api gratis por si me la intentas usarrr kkk
    apiKey: 'AIzaSyCYpydIwRu0Fbwc5ApZ-msTcM2pZWxumlo', // <--- Solo si es un entorno seguro (Backend)
    baseUrl: 'https://generativelanguage.googleapis.com', 
    
    // ... init function ...

    // Función genérica para llamar a Gemini
    async generateContent(prompt, systemInstruction = null) {
        // Define el modelo y el path
        const modelName = 'gemini-2.5-flash'; // Puedes cambiar a otro modelo, ej: 'gemini-2.5-pro'
        const fullUrl = `${this.baseUrl}/v1/models/${modelName}:generateContent`;

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Incluir la clave API como un encabezado X-Goog-Api-Key o parámetro de consulta
                    'x-api-key': this.apiKey, // <--- Aquí se agrega la clave para la llamada directa
                },
                body: JSON.stringify({
                    // Estructura de la API de Gemini
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    config: {
                        ...(systemInstruction && { systemInstruction: { text: systemInstruction } }), // Ajuste para systemInstruction
                    }
                })
            });
            
            // ... resto del manejo de respuesta
            
            const data = await response.json();
            
            // El resultado de la API es 'text' dentro de 'parts'
            if (!data.candidates || !data.candidates[0]) {
                // ... manejo de error ...
            }
            return data.candidates[0].content.parts[0].text; // <--- Correcto para Gemini
            
        } catch (error) {
            console.error('Error al llamar a Gemini:', error);
            throw error;
        }
    },
    // ... resto del objeto AI
};
