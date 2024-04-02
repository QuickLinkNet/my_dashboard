import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Initialisierung der Express-App
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Öffnen der SQLite-Datenbank (wird erstellt, falls nicht vorhanden)
const dbPromise = open({
    filename: './my_dashboard.db',
    driver: sqlite3.Database,
});

// Initialisierung der Datenbanktabellen
const initDB = async () => {
    const db = await dbPromise;
    await db.exec(`
    CREATE TABLE IF NOT EXISTS layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      layout TEXT
    )`);
    await db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      title TEXT, 
      prompt TEXT, 
      keywords TEXT, 
      expected_runs INTEGER, 
      successful_runs INTEGER
    )`);
    console.log('Datenbank und Tabellen initialisiert.');
};

initDB();

// Route: Layout abrufen
app.get('/api/layout/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;
        const layout = await db.get('SELECT * FROM layouts WHERE id = ?', id);
        if (layout) {
            res.json(layout);
        } else {
            res.status(404).send('Layout nicht gefunden');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route: Neues Layout hinzufügen
app.post('/api/layout', async (req, res) => {
    try {
        const db = await dbPromise;
        const { layout } = req.body;
        const result = await db.run('INSERT INTO layouts (layout) VALUES (?)', JSON.stringify(layout));
        res.json({ id: result.lastID, layout });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route: Layout aktualisieren
app.put('/api/layout/:id', async (req, res) => {
    const { id } = req.params;
    const layout = JSON.stringify(req.body); // Nehmen wir an, das Layout ist im Body als JSON
    try {
        const db = await dbPromise;
        // Stellen Sie sicher, dass die ID Teil des Layout-Objekts ist, falls Sie `INSERT OR REPLACE` nutzen
        await db.run(`INSERT OR REPLACE INTO layouts (id, layout) VALUES (?, ?)`, [id, layout]);
        res.send('Layout gespeichert oder aktualisiert');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route: Layout löschen
app.delete('/api/layout/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;
        await db.run('DELETE FROM layouts WHERE id = ?', id);
        res.send('Layout gelöscht');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route: Kryptopreise abrufen
app.get('/api/crypto-prices/', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin&vs_currencies=eur,usd');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Fehler beim Abrufen der Daten" });
    }
});

// Route: Prompts hinzufügen (Beispiel)
app.post('/api/prompts', async (req, res) => {
    try {
        const db = await dbPromise;
        const prompts = req.body;
        for (const prompt of prompts) {
            const { title, prompt: promptText, keywords, expected_runs } = prompt;
            await db.run('INSERT INTO prompts (title, prompt, keywords, expected_runs, successful_runs) VALUES (?, ?, ?, ?, 0)', title, promptText, keywords, expected_runs);
        }
        res.status(200).send('Alle Prompts wurden verarbeitet');
    } catch (error) {
        res.status(500).send('Fehler beim Einfügen der Prompts: ' + error.message);
    }
});

// Route: Alle Prompts abrufen mit Pagination
app.get('/api/prompts', async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    try {
        const db = await dbPromise;
        const totalResult = await db.get('SELECT COUNT(id) AS total FROM prompts');
        const prompts = await db.all('SELECT * FROM prompts LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ total: totalResult.total, prompts });
    } catch (error) {
        res.status(500).send('Fehler beim Abrufen der Prompts: ' + error.message);
    }
});

app.get('/api/prompts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await dbPromise;
        const prompt = await db.get('SELECT * FROM prompts WHERE id = ?', id);
        if (prompt) {
            res.json(prompt);
        } else {
            res.status(404).send('Prompt nicht gefunden');
        }
    } catch (error) {
        res.status(500).send('Fehler beim Abrufen des Prompts: ' + error.message);
    }
});

// Route: Prompt aktualisieren
app.put('/api/prompts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, prompt, keywords, expected_runs, successful_runs } = req.body;
    try {
        const db = await dbPromise;
        await db.run('UPDATE prompts SET title = ?, prompt = ?, keywords = ?, expected_runs = ?, successful_runs = ? WHERE id = ?', [title, prompt, keywords, expected_runs, successful_runs, id]);
        res.send('Prompt aktualisiert');
    } catch (error) {
        res.status(500).send('Fehler beim Aktualisieren des Prompts: ' + error.message);
    }
});

// Route: Prompt löschen
app.delete('/api/prompts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await dbPromise;
        await db.run('DELETE FROM prompts WHERE id = ?', id);
        res.send('Prompt gelöscht');
    } catch (error) {
        res.status(500).send('Fehler beim Löschen des Prompts: ' + error.message);
    }
});

// Weitere Routen hier entsprechend hinzufügen...

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
