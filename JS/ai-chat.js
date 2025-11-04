let chatHistory = [];

function initAIChat() {
    const aiChatToggle = document.getElementById('aiChatToggle');
    const aiChatClose = document.getElementById('aiChatClose');
    const aiChatPanel = document.getElementById('aiChatPanel');
    const aiChatSend = document.getElementById('aiChatSend');
    const aiChatInputField = document.getElementById('aiChatInputField');

    if (aiChatToggle) {
        aiChatToggle.addEventListener('click', () => {
            aiChatPanel.classList.toggle('active');
            if (aiChatPanel.classList.contains('active')) {
                aiChatInputField.focus();
            }
        });
    }

    if (aiChatClose) {
        aiChatClose.addEventListener('click', () => {
            aiChatPanel.classList.remove('active');
        });
    }

    if (aiChatSend) {
        aiChatSend.addEventListener('click', sendChatMessage);
    }

    if (aiChatInputField) {
        aiChatInputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    document.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const suggestion = e.target.getAttribute('data-suggestion');
            if (suggestion) {
                aiChatInputField.value = suggestion;
                sendChatMessage();
            }
        });
    });
}

async function sendChatMessage() {
    const aiChatInputField = document.getElementById('aiChatInputField');
    const aiChatMessages = document.getElementById('aiChatMessages');
    const message = aiChatInputField.value.trim();

    if (!message) return;

    if (!getUserApiKey()) {
        showToast('Por favor configura tu API Key de Gemini en Configuración', 'error');
        return;
    }

    addMessageToChat('user', message);
    aiChatInputField.value = '';

    chatHistory.push({
        role: 'user',
        content: message
    });

    const loadingMessage = addLoadingMessage();

    try {
        const context = chatHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`);
        const response = await AI.chat(message, context);

        chatHistory.push({
            role: 'assistant',
            content: response
        });

        removeLoadingMessage(loadingMessage);
        addMessageToChat('ai', response);

    } catch (error) {
        console.error('Error en el chat:', error);
        removeLoadingMessage(loadingMessage);
        addMessageToChat('ai', 'Lo siento, ocurrió un error al procesar tu mensaje. Verifica que tu API Key esté configurada correctamente.');
        showToast(error.message || 'Error en el chat', 'error');
    }
}

function addMessageToChat(type, content) {
    const aiChatMessages = document.getElementById('aiChatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'ai-message';

    const avatar = document.createElement('div');
    avatar.className = type === 'user' ? 'user-avatar' : 'ai-avatar';
    avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = type === 'user' ? 'user-message-content' : 'ai-message-content';
    messageContent.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    aiChatMessages.appendChild(messageDiv);

    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

function addLoadingMessage() {
    const aiChatMessages = document.getElementById('aiChatMessages');

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-message loading-message';
    loadingDiv.innerHTML = `
        <div class="ai-avatar"><i class="fas fa-robot"></i></div>
        <div class="ai-message-content">
            <i class="fas fa-spinner fa-spin"></i> Pensando...
        </div>
    `;

    aiChatMessages.appendChild(loadingDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    return loadingDiv;
}

function removeLoadingMessage(loadingMessage) {
    if (loadingMessage && loadingMessage.parentNode) {
        loadingMessage.parentNode.removeChild(loadingMessage);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIChat);
} else {
    initAIChat();
}
