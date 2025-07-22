// Interactive Chat Widget for n8n
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Load font resource
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Widget styles
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        /* ... [all your CSS styles remain unchanged] ... */
        /* You can keep your full style block here, as previously set */
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration
    const defaultSettings = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '',
            responseTimeText: '',
            poweredBy: {
                text: 'Powered by n8n',
                link: 'https://n8n.partnerlinks.io/fabimarkl'
            }
        },
        style: {
            primaryColor: '#10b981',
            secondaryColor: '#059669',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#1f2937'
        },
        suggestedQuestions: []
    };

    // Merge user settings with defaults
    const settings = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
            style: { 
                ...defaultSettings.style, 
                ...window.ChatWidgetConfig.style,
                primaryColor: window.ChatWidgetConfig.style?.primaryColor === '#854fff' ? '#10b981' : (window.ChatWidgetConfig.style?.primaryColor || '#10b981'),
                secondaryColor: window.ChatWidgetConfig.style?.secondaryColor === '#6b3fd4' ? '#059669' : (window.ChatWidgetConfig.style?.secondaryColor || '#059669')
            },
            suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
        } : defaultSettings;

    // Session tracking
    let conversationId = '';
    let isWaitingForResponse = false;

    // Create widget DOM structure
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';
    widgetRoot.style.setProperty('--chat-widget-primary', settings.style.primaryColor);
    widgetRoot.style.setProperty('--chat-widget-secondary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-tertiary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-surface', settings.style.backgroundColor);
    widgetRoot.style.setProperty('--chat-widget-text', settings.style.fontColor);

    // Create chat panel
    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    
    // Welcome + Chat HTML (no registration form)
    const welcomeScreenHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn">×</button>
        </div>
        <div class="chat-welcome">
            <h2 class="chat-welcome-title">${settings.branding.welcomeText}</h2>
            <button class="chat-start-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Start chatting
            </button>
            <p class="chat-response-time">${settings.branding.responseTimeText}</p>
        </div>
    `;
    const chatInterfaceHTML = `
        <div class="chat-body">
            <div class="chat-messages"></div>
            <div class="chat-controls">
                <textarea class="chat-textarea" placeholder="Type your message here..." rows="1"></textarea>
                <button class="chat-submit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 2L11 13"></path>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                </button>
            </div>
            <div class="chat-footer">
                <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank">${settings.branding.poweredBy.text}</a>
            </div>
        </div>
    `;
    chatWindow.innerHTML = welcomeScreenHTML + chatInterfaceHTML;

    // Toggle button
    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    launchButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span class="chat-launcher-text">Need help?</span>`;

    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);

    // Get DOM elements
    const startChatButton = chatWindow.querySelector('.chat-start-btn');
    const chatBody = chatWindow.querySelector('.chat-body');
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const messageTextarea = chatWindow.querySelector('.chat-textarea');
    const sendButton = chatWindow.querySelector('.chat-submit');
    const chatWelcome = chatWindow.querySelector('.chat-welcome');
    const closeButtons = chatWindow.querySelectorAll('.chat-close-btn');

    // Helper function to generate unique session ID
    function createSessionId() {
        return crypto.randomUUID();
    }

    // Typing indicator
    function createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        return indicator;
    }

    // Linkify URLs
    function linkifyText(text) {
        const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        return text.replace(urlPattern, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
        });
    }

    // Send message to webhook
    async function submitMessage(messageText) {
        if (isWaitingForResponse) return;
        isWaitingForResponse = true;

        if (!conversationId) {
            conversationId = createSessionId();
        }

        const requestData = {
            action: "sendMessage",
            sessionId: conversationId,
            route: settings.webhook.route,
            chatInput: messageText,
            metadata: {}
        };

        // User message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-bubble user-bubble';
        userMessage.textContent = messageText;
        messagesContainer.appendChild(userMessage);

        // Typing indicator
        const typingIndicator = createTypingIndicator();
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();

            // Remove typing indicator
            messagesContainer.removeChild(typingIndicator);

            // Bot response
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-bubble bot-bubble';
            const responseText = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            botMessage.innerHTML = linkifyText(responseText);
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            messagesContainer.removeChild(typingIndicator);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-bubble bot-bubble';
            errorMessage.textContent = "Sorry, I couldn't send your message. Please try again.";
            messagesContainer.appendChild(errorMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } finally {
            isWaitingForResponse = false;
        }
    }

    // Auto-resize textarea
    function autoResizeTextarea() {
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = (messageTextarea.scrollHeight > 120 ? 120 : messageTextarea.scrollHeight) + 'px';
    }

    // --- Event Listeners ---

    // Start chat: skip registration, go straight to chat
    startChatButton.addEventListener('click', () => {
        chatWelcome.style.display = 'none';
        chatBody.classList.add('active');
    });

    sendButton.addEventListener('click', () => {
        const messageText = messageTextarea.value.trim();
        if (messageText && !isWaitingForResponse) {
            submitMessage(messageText);
            messageTextarea.value = '';
            messageTextarea.style.height = 'auto';
        }
    });

    messageTextarea.addEventListener('input', autoResizeTextarea);

    messageTextarea.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const messageText = messageTextarea.value.trim();
            if (messageText && !isWaitingForResponse) {
                submitMessage(messageText);
                messageTextarea.value = '';
                messageTextarea.style.height = 'auto';
            }
        }
    });

    launchButton.addEventListener('click', () => {
        chatWindow.classList.toggle('visible');
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatWindow.classList.remove('visible');
        });
    });

    // Optionally, display suggested questions after chat starts
    function displaySuggestedQuestions() {
        if (
            settings.suggestedQuestions &&
            Array.isArray(settings.suggestedQuestions) &&
            settings.suggestedQuestions.length > 0
        ) {
            const suggestedQuestionsContainer = document.createElement('div');
            suggestedQuestionsContainer.className = 'suggested-questions';

            settings.suggestedQuestions.forEach(question => {
                const questionButton = document.createElement('button');
                questionButton.className = 'suggested-question-btn';
                questionButton.textContent = question;
                questionButton.addEventListener('click', () => {
                    submitMessage(question);
                    if (suggestedQuestionsContainer.parentNode) {
                        suggestedQuestionsContainer.parentNode.removeChild(suggestedQuestionsContainer);
                    }
                });
                suggestedQuestionsContainer.appendChild(questionButton);
            });

            messagesContainer.appendChild(suggestedQuestionsContainer);
        }
    }

    // Show suggested questions after entering chat
    startChatButton.addEventListener('click', displaySuggestedQuestions);

})();
