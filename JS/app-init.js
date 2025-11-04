document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');

    // First, check if the user is authenticated
    const isAuthenticated = await checkAuth();

    // If authenticated, initialize the main application logic
    if (isAuthenticated) {
        // Ensure initializeApp is defined and available
        if (typeof initializeApp === 'function') {
            await initializeApp();
        } else {
            console.error('initializeApp function is not defined. Make sure script.js is loaded correctly.');
        }
    } else {
        // If not authenticated, the checkAuth function should have already redirected to the login page.
        // You can add a fallback message here if needed.
        console.log('User is not authenticated. Redirecting to login page.');
    }

    // You can keep other initializations that are not dependent on authentication here.
    // For example, theme toggle can be initialized regardless of auth state.
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            themeToggleButton.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        if (themeToggleButton) {
            themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    const aiChatToggleButton = document.getElementById('ai-chat-toggle');
    const aiChatPanel = document.getElementById('ai-chat-panel');
    if (aiChatToggleButton && aiChatPanel) {
        aiChatToggleButton.addEventListener('click', () => {
            aiChatPanel.classList.toggle('open');
            aiChatToggleButton.classList.toggle('open');
        });
    }

    const closeModalButton = document.querySelector('.close-modal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            const modal = closeModalButton.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
});
