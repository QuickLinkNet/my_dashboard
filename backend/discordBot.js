import discordJs from 'discord.js';
import 'dotenv/config';

const { Client, Intents } = discordJs;

// Initialisieren des Discord-Clients mit den erforderlichen Intents
const client = new Client({
    intents: [Intents.FLAGS.Guilds, Intents.FLAGS.GuildMessages, Intents.FLAGS.MessageContent]
});

// Funktion zum Senden einer Nachricht mit einem Command
async function sendMessage(channelId, message) {
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.send(message);
        console.log('Nachricht gesendet:', message);
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

// Event-Listener für Nachrichten
client.on('messageCreate', async (message) => {
    // Ignorieren von Nachrichten des Bots selbst
    if (message.author.id === client.user.id) return;

    // Prüfen, ob die Nachricht mit "/imagine" beginnt
    if (message.content.startsWith('/imagine')) {
        // Nachricht ohne den Befehl extrahieren
        const imaginedMessage = message.content.slice('/imagine'.length).trim();

        // Nachricht senden
        await sendMessage(message.channelId, imaginedMessage);
    }
});

// Beim Start einloggen
login();

export default sendMessage;
