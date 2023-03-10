const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");

require('dotenv').config()

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.executingCooldowns = new Collection();
client.COOLDOWN_SECONDS = 60; // 1 minute for rate limit interval

// Retrieve commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Setup command files (command handler)
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property.`)
    }
}

// Setup event files (event handler)
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

// https://stackoverflow.com/questions/71756140/error-while-loading-shared-libraries-libnss3-so-cannot-open-shared-object-file