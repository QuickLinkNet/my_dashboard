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
    host: '192.168.2.49',
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

app.get('/api/prompts/pending', (req: Request, res: Response) => {
    // Limit dynamisch aus der Abfrage lesen, Standardwert 5
    const limit = parseInt(req.query.limit as string, 10) || 5;

    db.query('SELECT * FROM prompts WHERE successful_runs < expected_runs LIMIT ?', [limit], (err, results) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(results);
    });
});

app.put('/api/prompts/:id/increment-success', (req: Request, res: Response) => {
    const id = req.params.id;

    db.query('SELECT successful_runs FROM prompts WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send('Fehler beim Abrufen der Daten: ' + err.message);
        }

        if (results.length === 0) {
            return res.status(404).send('Prompt nicht gefunden');
        }

        const currentSuccessfulRuns = results[0].successful_runs;
        const newSuccessfulRuns = currentSuccessfulRuns + 1;

        db.query('UPDATE prompts SET successful_runs = ? WHERE id = ?', [newSuccessfulRuns, id], (updateErr, updateResult) => {
            if (updateErr) {
                return res.status(500).send('Fehler beim Aktualisieren der Daten: ' + updateErr.message);
            }

            const logEntry = {
                prompt_id: id,
                date: new Date(),
                success: 1
            };

            db.query('INSERT INTO prompt_log SET ?', logEntry, (logErr, logResult) => {
                if (logErr) {
                    return res.status(500).send('Fehler beim Speichern der Log-Daten: ' + logErr.message);
                }

                res.json({ id, successful_runs: newSuccessfulRuns });
            });
        });
    });
});

app.get('/api/prompt-success-logs', (req: Request, res: Response) => {
    const { start_date, end_date, prompt_id, limit = 100 } = req.query;

    // Basis SQL-Query
    let query = 'SELECT * FROM prompt_log WHERE 1=1';
    const queryParams: any[] = [];

    // Zeiträume dynamisch filtern
    if (start_date) {
        query += ' AND success_time >= ?';
        queryParams.push(start_date);
    }

    if (end_date) {
        query += ' AND success_time <= ?';
        queryParams.push(end_date);
    }

    // Nach Prompt filtern, falls prompt_id angegeben ist
    if (prompt_id) {
        query += ' AND prompt_id = ?';
        queryParams.push(prompt_id);
    }

    // Limit zur Begrenzung der Ergebnismenge
    query += ' ORDER BY success_time DESC LIMIT ?';
    queryParams.push(parseInt(limit as string, 10));

    // Führe die Datenbankabfrage aus
    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send('Fehler beim Abrufen der Logs: ' + err.message);
        }
        res.json(results);
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

// Erstellen eines neuen Todo
app.post('/api/todos', (req: Request, res: Response) => {
    const { title, description, status, priority, due_date } = req.body;
    const newTodo = { title, description, status, priority, due_date };

    db.query('INSERT INTO todos SET ?', newTodo, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ id: result.insertId, ...newTodo });
    });
});

// Lesen aller Todos mit optionaler Paginierung und Filterung nach Fälligkeitsdatum
app.get('/api/todos', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 9999;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const dueDate = req.query.due_date as string;

    let query = 'SELECT * FROM todos';
    let queryParams: any[] = [];

    if (dueDate) {
        query += ' WHERE due_date = ?';
        queryParams.push(dueDate);
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    db.query(query, queryParams, (err, todosResults) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.json(todosResults);
    });
});

// Lesen eines einzelnen Todo nach ID
app.get('/api/todos/:id', (req: Request, res: Response) => {
    const id = req.params.id;

    db.query('SELECT * FROM todos WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).send('Todo nicht gefunden');
        }
    });
});

// Aktualisieren eines bestehenden Todo nach ID
app.put('/api/todos/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const { title, description, status, priority, due_date, done } = req.body;
    const updatedTodo = { title, description, status, priority, due_date, done };

    db.query('UPDATE todos SET ? WHERE id = ?', [updatedTodo, id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Todo aktualisiert');
    });
});

// Löschen eines Todo nach ID
app.delete('/api/todos/:id', (req: Request, res: Response) => {
    const id = req.params.id;

    db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Todo gelöscht');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
