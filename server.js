import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';

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

// Route zum Abrufen des Layouts
app.get('/api/layout', (req, res) => {
    db.query('SELECT * FROM layouts', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Route zum Speichern des Layouts
app.post('/api/layout', (req, res) => {
    const newLayout = { layout: JSON.stringify(req.body) };
    db.query('INSERT INTO layouts SET ?', newLayout, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ id: result.insertId, ...newLayout });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
