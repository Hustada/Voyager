const Observation = require("./base.js").Observation;

class onChat extends Observation {
    constructor(bot) {
        super(bot);
        this.name = "onChat";
        this.obs = "";
        this.messages = [];  // Structured message storage
        this.botUsername = bot.username || "bot";  // This bot's username
        this.knownBots = ["minerva", "steve", "scout", "bot"];  // Known bot usernames
        this.maxMessages = 20;  // Keep last N messages

        bot.on("chatEvent", (username, message) => {
            // Ignore commands
            if (message.startsWith("/")) {
                return;
            }

            // Ignore our own messages
            if (username === this.botUsername) {
                return;
            }

            // Create structured message
            const structuredMsg = {
                sender: username,
                message: message,
                timestamp: Date.now(),
                isBot: this.knownBots.includes(username.toLowerCase()),
                isPlayer: !this.knownBots.includes(username.toLowerCase()),
                mentionsMe: this._checkMention(message, this.botUsername),
                mentionsAll: message.toLowerCase().includes("@all") ||
                            message.toLowerCase().includes("everyone")
            };

            // Add to message queue
            this.messages.push(structuredMsg);
            if (this.messages.length > this.maxMessages) {
                this.messages.shift();
            }

            // Also update legacy obs for backward compatibility
            this.obs += `[${username}]: ${message}\n`;

            this.bot.event(this.name);
        });
    }

    _checkMention(message, botName) {
        const lowerMsg = message.toLowerCase();
        const lowerName = botName.toLowerCase();

        // Check for @mention
        if (lowerMsg.includes(`@${lowerName}`)) return true;

        // Check for name at start of message (e.g., "minerva, do something")
        if (lowerMsg.startsWith(lowerName)) return true;

        // Check for name anywhere with common patterns
        const patterns = [
            `hey ${lowerName}`,
            `${lowerName},`,
            `${lowerName}!`,
            `${lowerName}?`
        ];
        return patterns.some(p => lowerMsg.includes(p));
    }

    observe() {
        // Return legacy string format for backward compatibility
        const result = this.obs;
        this.obs = "";
        return result;
    }

    // New method: get structured messages
    observeStructured() {
        const messages = [...this.messages];
        this.messages = [];
        return messages;
    }

    // New method: get messages directed at this bot
    getDirectedMessages() {
        return this.messages.filter(m => m.mentionsMe || m.mentionsAll);
    }

    // New method: check if there are pending messages for this bot
    hasPendingMessages() {
        return this.messages.some(m => m.mentionsMe || m.mentionsAll);
    }

    // Set this bot's username (called from Python when bot_id is known)
    setBotUsername(username) {
        this.botUsername = username;
    }

    // Add a known bot username
    addKnownBot(username) {
        if (!this.knownBots.includes(username.toLowerCase())) {
            this.knownBots.push(username.toLowerCase());
        }
    }
}

module.exports = onChat;
