import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';
import axios from "axios";

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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
