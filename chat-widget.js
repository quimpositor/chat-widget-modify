// Interactive Chat Widget for n8n - No Registration Form
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Load font resource
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Widget styles - COMPLETE CSS WITH NO FORM STYLES
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-widget-primary: #10b981;
            --chat-widget-secondary: #059669;
            --chat-widget-tertiary: #059669;
            --chat-widget-surface: #ffffff;
            --chat-widget-text: #1f2937;
            font-family: 'Poppins', sans-serif;
            position: fixed;
            z-index: 10000;
        }

        .chat-window {
            position: fixed;
            bottom: 100px;
            width: 380px;
            height: 600px;
            background: var(--chat-widget-surface);
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
            transform: translateY(100%) scale(0.8);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chat-window.right-side {
            right: 24px;
        }

        .chat-window.left-side {
            left: 24px;
        }

        .chat-window.visible {
            transform: translateY(0) scale(1);
            opacity: 1;
            visibility: visible;
        }

        .chat-header {
            display: flex;
            align-items: center;
            padding: 20px;
            background: var(--chat-widget-primary);
            border-radius: 16px 16px 0 0;
            color: white;
            position: relative;
        }

        .chat-header-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            object-fit: cover;
        }

        .chat-header-title {
            font-weight: 600;
            font-size: 18px;
            flex: 1;
        }

        .chat-close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background-color 0.2s;
        }

        .chat-close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .chat-welcome {
            padding: 32px 24px;
            text-align: center;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .chat-welcome-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--chat-widget-text);
            margin: 0 0 24px 0;
            line-height: 1.3;
        }

        .chat-start-btn {
            background: var(--chat-widget-primary);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background-color 0.2s;
            margin-bottom: 16px;
        }

        .chat-start-btn:hover {
            background: var(--chat-widget-secondary);
        }

        .chat-response-time {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }

        .chat-body {
            display: none;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
        }

        .chat-body.active {
            display: flex;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .chat-bubble {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .user-bubble {
            background: var(--chat-widget-primary);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 6px;
        }

        .bot-bubble {
            background: #f3f4f6;
            color: var(--chat-widget-text);
            align-self: flex-start;
            border-bottom-left-radius: 6px;
        }

        .chat-link {
            color: var(--chat-widget-primary);
            text-decoration: underline;
        }

        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            background: #f3f4f6;
            border-radius: 18px;
            border-bottom-left-radius: 6px;
            align-self: flex-start;
            max-width: 60px;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            background: #9ca3af;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: scale(1);
                opacity: 0.5;
            }
            30% {
                transform: scale(1.2);
                opacity: 1;
            }
        }

        .suggested-questions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 16px 0;
        }

        .suggested-question-btn {
            background: white;
            border: 1px solid #e5e7eb;
            color: var(--chat-widget-text);
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
        }

        .suggested-question-btn:hover {
            background: var(--chat-widget-primary);
            color: white;
            border-color: var(--chat-widget-primary);
        }

        .chat-controls {
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            align-items: flex-end;
            gap: 12px;
        }

        .chat-textarea {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
            resize: none;
            outline: none;
            min-height: 44px;
            max-height: 120px;
            font-family: inherit;
            line-height: 1.4;
        }

        .chat-textarea:focus {
            border-color: var(--chat-widget-primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .chat-submit {
            background: var(--chat-widget-primary);
            border: none;
            border-radius: 12px;
            padding: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
            min-width: 44px;
            height: 44px;
        }

        .chat-submit:hover {
            background: var(--chat-widget-secondary);
        }

        .chat-submit svg {
            width: 20px;
            height: 20px;
            color: white;
        }

        .chat-footer {
            padding: 12px 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .chat-footer-link {
            color: #6b7280;
            text-decoration: none;
            font-size: 12px;
        }

        .chat-footer-link:hover {
            color: var(--chat-widget-primary);
        }

        .chat-launcher {
            position: fixed;
            bottom: 24px;
            width: 60px;
            height: 60px;
            background: var(--chat-widget-primary);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            transition: all 0.3s;
            overflow: hidden;
        }

        .chat-launcher.right-side {
            right: 24px;
        }

        .chat-launcher.left-side {
            left: 24px;
        }

        .chat-launcher:hover {
            transform: scale(1.1);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .chat-launcher svg {
            width: 24px;
            height: 24px;
            color: white;
            transition: transform 0.3s;
        }

        .chat-launcher-text {
            position: absolute;
            right: 70px;
            background: var(--chat-widget-text);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            opacity: 0;
            transform: translateX(10px);
            transition: all 0.3s;
            pointer-events: none;
        }

        .chat-launcher.left-side .chat-launcher-text {
            left: 70px;
            right: auto;
            transform: translateX(-10px);
        }

        .chat-launcher:hover .chat-launcher-text {
            opacity: 1;
            transform: translateX(0);
        }

        .chat-launcher-text::after {
            content: '';
            position: absolute;
            top: 50%;
            left: -6px;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border: 6px solid transparent;
            border-right-color: var(--chat-widget-text);
        }

        .chat-launcher.left-side .chat-launcher-text::after {
            left: auto;
            right: -6px;
            border-right-color: transparent;
            border-left-color: var(--chat-widget-text);
        }

        /* FORCE HIDE ANY REGISTRATION FORMS */
        .registration-form,
        .user-registration,
        .chat-registration,
        .email-form,
        .name-form,
        .chat-form,
        .registration-container,
        .user-details-form,
        .contact-form,
        [class*="registration"],
        [class*="user-form"],
        [class*="contact-form"],
        form:not(.chat-controls) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
            .chat-window {
                width: calc(100vw - 32px);
                height: calc(100vh - 120px);
                bottom: 80px;
                left: 16px !important;
                right: 16px !important;
            }
        }
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration
    const defaultSettings = {
        webhook: { url: '', route: '' },
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
    const settings = window.ChatWidgetConfig ? {
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
    
    // Welcome + Chat HTML (NO REGISTRATION FORM AT ALL)
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

    // Suggested Questions
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

    // --- Event Listeners ---

    // Start chat: SKIP REGISTRATION - GO DIRECTLY TO CHAT
    startChatButton.addEventListener('click', () => {
        // Hide welcome screen
        chatWelcome.style.display = 'none';
        
        // Force hide any potential forms that might exist
        const allForms = document.querySelectorAll('form, .registration-form, .user-registration, .chat-form, .email-form, .name-form, [class*="registration"]');
        allForms.forEach(form => {
            form.style.display = 'none';
            form.style.visibility = 'hidden';
            form.style.opacity = '0';
            form.style.height = '0';
            form.style.overflow = 'hidden';
        });
        
        // Show chat interface IMMEDIATELY
        chatBody.classList.add('active');
        chatBody.style.display = 'flex';
        
        // Show suggested questions
        displaySuggestedQuestions();
        
        // Focus on textarea so user can start typing
        setTimeout(() => {
            messageTextarea.focus();
        }, 100);
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

})();
