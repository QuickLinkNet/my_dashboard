import * as express from 'express';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as mysql from 'mysql';
import * as cors from 'cors';
import axios from "axios";

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

app.post('/api/send-discord-message', (req: Request, res: Response) => {
    const { channelId, message } = req.body;
    // Hier fehlt die Implementierung für das Senden einer Nachricht an Discord
    // sendMessage(channelId, message)
    //     .then(() => res.send('Nachricht erfolgreich gesendet'))
    //     .catch(err => res.status(500).send('Fehler beim Senden der Nachricht: ' + err.message));
});

app.get('/api/layout/:id', (req: Request, res: Response) => {
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

app.post('/api/layout', (req: Request, res: Response) => {
    const newLayout = { layout: JSON.stringify(req.body) };
    db.query('INSERT INTO layouts SET ?', newLayout, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ id: result.insertId, ...newLayout });
    });
});

app.put('/api/layout/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const updatedLayout = JSON.stringify(req.body);

    // Verwende UPSERT Logik
    const query = `
        INSERT INTO layouts (id, layout) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE layout = VALUES(layout);
    `;

    db.query(query, [id, updatedLayout], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Überprüfe das Ergebnis, um festzustellen, ob es sich um ein Update oder ein Insert handelt
        if (result.affectedRows === 0) {
            res.send('Keine Änderung vorgenommen.');
        } else if (result.affectedRows === 1 && result.insertId) {
            res.send('Neues Layout angelegt.');
        } else {
            res.send('Layout aktualisiert.');
        }
    });
});

app.delete('/api/layout/:id', (req: Request, res: Response) => {
    const id = req.params.id;

    db.query('DELETE FROM layouts WHERE id = ?', id, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Layout gelöscht');
    });
});

app.get('/api/crypto-prices/', async (req: Request, res: Response) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin&vs_currencies=eur,usd');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Fehler beim Abrufen der Daten" });
    }
});

app.post('/api/prompts', async (req: Request, res: Response) => {
    const prompts = req.body;

    const insertPrompts = prompts.map(async (prompt: any) => {
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

app.get('/api/prompts', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 9999;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    db.query('SELECT COUNT(*) AS total FROM prompts', (err, totalResults) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const total = totalResults[0].total;

        db.query('SELECT * FROM prompts LIMIT ? OFFSET ?', [limit, offset], (err, promptsResults) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            res.json({
                prompts: promptsResults,
                total: total
            });
        });
    });
});

app.get('/api/prompts/:id', (req: Request, res: Response) => {
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

app.put('/api/prompts/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const { title, prompt, keywords } = req.body;
    db.query('UPDATE prompts SET title = ?, prompt = ?, keywords = ? WHERE id = ?', [title, prompt, keywords, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Prompt aktualisiert');
    });
});

app.delete('/api/prompts/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    db.query('DELETE FROM prompts WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Prompt gelöscht');
    });
});

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).send('Backend verbunden');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
