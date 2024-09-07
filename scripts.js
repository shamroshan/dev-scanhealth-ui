// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');

    // Predefined responses for specific user inputs
    const responses = {
        "Hello": "Hi there! How can I help you today?",
        "What is your name?": "I'm your virtual assistant. How can I assist you?",
    };

    /**
     * Fetches a response from the server based on user input.
     * @param {string} userInput - The user's input to send to the server.
     * @returns {Promise<string>} - The response from the server.
     */
    async function fetchBotResponse(userInput) {
        try {
            // Send user input to the server and get a response
            const response = await fetch("https://scanhealth-api.azurewebsites.net/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: "user", content: userInput }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error("Error fetching or rendering response:", error);
            return "An error occurred while fetching the response.";
        }
    }

    /**
     * Appends a message to the chat box.
     * @param {string} role - The role of the message sender ('user' or 'bot').
     * @param {string} content - The content of the message.
     */
    function appendMessage(role, content) {
        // Create message container
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", role);

        // Create and configure avatar element
        const avatarElement = document.createElement("div");
        avatarElement.classList.add("avatar");
        
        if (role === 'user') {
            avatarElement.textContent = 'U'; // User avatar text
            avatarElement.style.backgroundColor = '#0056b3'; // User avatar color
            avatarElement.style.color = '#fff'; // User avatar text color
            avatarElement.style.fontSize = '24px'; // Font size for 'U'
        } else {
            avatarElement.style.backgroundImage = 'url("/static/scanhealth.png")'; // Bot avatar
            avatarElement.style.backgroundSize = 'cover';
        }

        messageElement.appendChild(avatarElement);

        // Create and configure message content element
        const contentElement = document.createElement("div");
        contentElement.classList.add("message-content");
        
        try {
            // Render markdown content if `marked` is available
            if (typeof marked.parse === "function") {
                contentElement.innerHTML = marked.parse(content);
            } else {
                throw new Error("marked.parse is not a function");
            }
        } catch (error) {
            console.error("Error rendering markdown:", error);
            contentElement.textContent = content;
        }

        messageElement.appendChild(contentElement);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box
    }

    /**
     * Handles user input and updates the chat interface.
     */
    async function handleUserInput() {
        const text = userInput.value.trim();
        if (text) {
            appendMessage('user', text);
            userInput.value = '';

            // Display loading animation while waiting for the bot response
            const loadingElement = document.createElement('div');
            loadingElement.classList.add('message', 'bot', 'loading');
            loadingElement.innerHTML = `
                <div class="avatar"></div>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>`;
            chatBox.appendChild(loadingElement);
            chatBox.scrollTop = chatBox.scrollHeight;

            // Determine the bot's response
            let botResponse;
            if (responses[text]) {
                botResponse = responses[text];
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay for predefined responses
            } else {
                botResponse = await fetchBotResponse(text);
            }

            // Remove loading animation and append bot's response
            chatBox.removeChild(loadingElement);
            appendMessage('bot', botResponse);
        }
    }

    // Attach event listeners to buttons and input field
    sendBtn.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleUserInput();
        }
    });

    newChatBtn.addEventListener('click', () => {
        chatBox.innerHTML = ''; // Clear the chat box for a new chat
    });

    closeChatBtn.addEventListener('click', () => {
        document.querySelector('.chat-window').style.display = 'none'; // Hide the chat window
    });
});
