// discordBot.js
import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// Initialisieren des Discord-Clients mit den erforderlichen Intents
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Funktion zum Senden einer Nachricht mit einem Command
async function sendMessage(channelId, message) {
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.send(`/imagine ${message}`);
        console.log('Nachricht gesendet:', `/imagine ${message}`);
    } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
    }
}

// Funktion zum Einloggen des Bots
function login() {
    client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
        console.log(`Eingeloggt als ${client.user.tag}`);
    }).catch(console.error);
}

// Beim Start einloggen
login();

export { sendMessage };
