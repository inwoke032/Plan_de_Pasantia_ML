const { createClient } = supabase;

const supabaseClient = createClient(
    'https://caxatovfgotdikwuglsx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheGF0b3ZmZ290ZGlrd3VnbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODAwMTQsImV4cCI6MjA3NzA1NjAxNH0.nIqLaFqcwkIQ1wLdFDdxIq20r9sIqvdEAQzAcXsTYdY'
);

let currentUser = null;
let userApiKey = null;

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    let userIsAuthenticated = false;
    if (session) {
        currentUser = session.user;
        localStorage.setItem('user', JSON.stringify(session.user));
        localStorage.setItem('isAuthenticated', 'true');
        userIsAuthenticated = true;
    } else if (localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('user')) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        userIsAuthenticated = true;
    }

    if (userIsAuthenticated) {
        await loadUserApiKey();
        if (window.location.pathname.endsWith('auth.html')) {
            window.location.replace('index.html');
        }
        return true;
    }

    if (!window.location.pathname.endsWith('auth.html')) {
        localStorage.clear();
        window.location.replace('auth.html');
    }
    return false;
}

async function signOut() {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    currentUser = null;
    userApiKey = null;
    window.location.replace('auth.html');
}

async function loadUserApiKey() {
    if (!currentUser) return;
    try {
        const { data, error } = await supabaseClient
            .from('user_config')
            .select('gemini_api_key')
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (data && data.gemini_api_key) {
            userApiKey = data.gemini_api_key;
        }
    } catch (error) {
        console.error('Error loading user config:', error);
    }
}

async function saveUserApiKey(apiKey) {
    if (!currentUser) {
        showToast('Debes iniciar sesión para guardar una API key', 'error');
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from('user_config')
            .upsert({
                user_id: currentUser.id,
                gemini_api_key: apiKey,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) throw error;

        userApiKey = apiKey;
        return true;
    } catch (error) {
        console.error('Error saving API key:', error);
        throw error;
    }
}

function getUserApiKey() {
    return userApiKey;
}

function getCurrentUser() {
    return currentUser;
}

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        if (window.location.pathname.endsWith('auth.html')) {
            window.location.replace('index.html');
        }
    } else if (event === 'SIGNED_OUT') {
        localStorage.clear();
        currentUser = null;
        userApiKey = null;
        window.location.replace('auth.html');
    }
});