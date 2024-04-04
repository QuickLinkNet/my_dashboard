import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';
import axios from "axios";
// import { sendMessage } from './discordBot.js';
import sendMessage from "./discordBot.js";
// const { sendMessage } = require('./discordBot.js');

const app = express();
app.use(cors()); // Aktiviere CORS
app.use(bodyParser.json());

// MySQL-Verbindung
const db = mysql.createConnection({
    host: '192.168.178.14',
    user: 'root',
    password: '',
    database: 'my_dashboard'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL verbunden...');
});

app.post('/api/send-discord-message', (req, res) => {
    const { channelId, message } = req.body;
    // const result = await MyMidjourneyClient.sendImagineCommand(prompt);
    sendMessage(channelId, message)
        .then(() => res.send('Nachricht erfolgreich gesendet'))
        .catch(err => res.status(500).send('Fehler beim Senden der Nachricht: ' + err.message));
});

app.get('/api/layout/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM layouts WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('Layout nicht gefunden');
        }
    });
});

app.post('/api/layout', (req, res) => {
    const newLayout = { layout: JSON.stringify(req.body) };
    db.query('INSERT INTO layouts SET ?', newLayout, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ id: result.insertId, ...newLayout });
    });
});

app.put('/api/layout/:id', (req, res) => {
    const id = req.params.id;
    const updatedLayout = JSON.stringify(req.body);

    db.query('UPDATE layouts SET layout = ? WHERE id = ?', [updatedLayout, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Layout aktualisiert');
    });
});

app.delete('/api/layout/:id', (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM layouts WHERE id = ?', id, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Layout gelöscht');
    });
});

app.get('/api/crypto-prices/', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin&vs_currencies=eur,usd');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Fehler beim Abrufen der Daten" });
    }
});

app.post('/api/prompts', async (req, res) => {
    const prompts = req.body;

    const insertPrompts = prompts.map(async (prompt) => {
        const { title, prompt: promptText, keywords, expected_runs } = prompt;
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO prompts (title, prompt, keywords, expected_runs, successful_runs) VALUES (?, ?, ?, ?, ?)',
                [title, promptText, keywords, expected_runs, 0], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
        });
    });

    try {
        await Promise.all(insertPrompts);
        res.status(200).send('Alle Prompts wurden verarbeitet');
    } catch (err) {
        res.status(500).send('Fehler beim Einfügen der Prompts: ' + err.message);
    }
});

app.get('/api/prompts', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 9999;
    const offset = parseInt(req.query.offset, 10) || 0;

    // Zuerst die Gesamtanzahl der Einträge ermitteln
    db.query('SELECT COUNT(*) AS total FROM prompts', (err, totalResults) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Gesamtanzahl aus den Ergebnissen extrahieren
        const total = totalResults[0].total;

        // Dann die eigentlichen Daten abfragen
        db.query('SELECT * FROM prompts LIMIT ? OFFSET ?', [limit, offset], (err, promptsResults) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            // Ergebnisse und Gesamtanzahl senden
            res.json({
                prompts: promptsResults,
                total: total
            });
        });
    });
});


app.get('/api/prompts/:id', (reqf, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM prompts WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).send('Prompt nicht gefunden');
        }
    });
});

app.put('/api/prompts/:id', (req, res) => {
    const id = req.params.id;
    const { title, prompt, keywords } = req.body;
    db.query('UPDATE prompts SET title = ?, prompt = ?, keywords = ? WHERE id = ?', [title, prompt, keywords, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Prompt aktualisiert');
    });
});

app.delete('/api/prompts/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM prompts WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Prompt gelöscht');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
