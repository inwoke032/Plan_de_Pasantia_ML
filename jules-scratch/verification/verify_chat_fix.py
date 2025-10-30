from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Navigate to the app's login page
    page.goto('http://localhost:8000/auth.html')

    # Mock the login process to bypass the need for credentials
    page.evaluate("""
      localStorage.setItem('user', JSON.stringify({
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      }));
    """)

    # After mocking, navigate to the main page
    page.goto('http://localhost:8000/index.html')

    # Mock the AI.chat function to return a predefined response
    page.evaluate("""
      window.AI = {
        chat: async () => 'This is a mocked response.',
      };
    """)

    # Open the AI Chat Panel
    page.click('#aiChatToggle')

    # Send a message
    page.fill('#aiChatInputField', 'Hello, world!')
    page.click('#aiChatSend')

    # Wait for the response and take a screenshot
    page.wait_for_selector('#aiChatMessages .ai-message:last-child .ai-message-content')
    page.screenshot(path='jules-scratch/verification/verification.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
