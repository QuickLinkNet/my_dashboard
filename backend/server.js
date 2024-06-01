"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var cors = require("cors");
var axios_1 = require("axios");
var app = express();
app.use(cors());
app.use(bodyParser.json());
var db = mysql.createConnection({
    host: '192.168.178.14',
    user: 'root',
    password: '',
    database: 'my_dashboard'
});
db.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log('MySQL verbunden...');
});
app.post('/api/send-discord-message', function (req, res) {
    var _a = req.body, channelId = _a.channelId, message = _a.message;
    // Hier fehlt die Implementierung für das Senden einer Nachricht an Discord
    // sendMessage(channelId, message)
    //     .then(() => res.send('Nachricht erfolgreich gesendet'))
    //     .catch(err => res.status(500).send('Fehler beim Senden der Nachricht: ' + err.message));
});
app.get('/api/layout/:id', function (req, res) {
    var id = req.params.id;
    db.query('SELECT * FROM layouts WHERE id = ?', [id], function (err, results) {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            res.json(results[0]);
        }
        else {
            res.status(404).send('Layout nicht gefunden');
        }
    });
});
app.post('/api/layout', function (req, res) {
    var newLayout = { layout: JSON.stringify(req.body) };
    db.query('INSERT INTO layouts SET ?', newLayout, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(__assign({ id: result.insertId }, newLayout));
    });
});
app.put('/api/layout/:id', function (req, res) {
    var id = req.params.id;
    var updatedLayout = JSON.stringify(req.body);
    // Verwende UPSERT Logik
    var query = "\n        INSERT INTO layouts (id, layout) VALUES (?, ?)\n        ON DUPLICATE KEY UPDATE layout = VALUES(layout);\n    ";
    db.query(query, [id, updatedLayout], function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        // Überprüfe das Ergebnis, um festzustellen, ob es sich um ein Update oder ein Insert handelt
        if (result.affectedRows === 0) {
            res.send('Keine Änderung vorgenommen.');
        }
        else if (result.affectedRows === 1 && result.insertId) {
            res.send('Neues Layout angelegt.');
        }
        else {
            res.send('Layout aktualisiert.');
        }
    });
});
app.delete('/api/layout/:id', function (req, res) {
    var id = req.params.id;
    db.query('DELETE FROM layouts WHERE id = ?', id, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Layout gelöscht');
    });
});
app.get('/api/crypto-prices/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin&vs_currencies=eur,usd')];
            case 1:
                response = _a.sent();
                res.json(response.data);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({ message: "Fehler beim Abrufen der Daten" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/prompts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var prompts, insertPrompts, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                prompts = req.body;
                insertPrompts = prompts.map(function (prompt) { return __awaiter(void 0, void 0, void 0, function () {
                    var title, promptText, keywords, expected_runs;
                    return __generator(this, function (_a) {
                        title = prompt.title, promptText = prompt.prompt, keywords = prompt.keywords, expected_runs = prompt.expected_runs;
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                db.query('INSERT INTO prompts (title, prompt, keywords, expected_runs, successful_runs) VALUES (?, ?, ?, ?, ?)', [title, promptText, keywords, expected_runs, 0], function (err, result) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(result);
                                    }
                                });
                            })];
                    });
                }); });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Promise.all(insertPrompts)];
            case 2:
                _a.sent();
                res.status(200).send('Alle Prompts wurden verarbeitet');
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                res.status(500).send('Fehler beim Einfügen der Prompts: ' + err_1.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/prompts', function (req, res) {
    var limit = parseInt(req.query.limit, 10) || 9999;
    var offset = parseInt(req.query.offset, 10) || 0;
    db.query('SELECT COUNT(*) AS total FROM prompts', function (err, totalResults) {
        if (err) {
            return res.status(500).send(err.message);
        }
        var total = totalResults[0].total;
        db.query('SELECT * FROM prompts LIMIT ? OFFSET ?', [limit, offset], function (err, promptsResults) {
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
app.get('/api/prompts/:id', function (req, res) {
    var id = req.params.id;
    db.query('SELECT * FROM prompts WHERE id = ?', [id], function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length > 0) {
            res.json(result[0]);
        }
        else {
            res.status(404).send('Prompt nicht gefunden');
        }
    });
});
app.put('/api/prompts/:id', function (req, res) {
    var id = req.params.id;
    var _a = req.body, title = _a.title, prompt = _a.prompt, keywords = _a.keywords;
    db.query('UPDATE prompts SET title = ?, prompt = ?, keywords = ? WHERE id = ?', [title, prompt, keywords, id], function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Prompt aktualisiert');
    });
});
app.delete('/api/prompts/:id', function (req, res) {
    var id = req.params.id;
    db.query('DELETE FROM prompts WHERE id = ?', [id], function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Prompt gelöscht');
    });
});
app.get('/api/health', function (req, res) {
    res.status(200).send('Backend verbunden');
});
// Erstellen eines neuen Todo
app.post('/api/todos', function (req, res) {
    var _a = req.body, title = _a.title, description = _a.description, status = _a.status, priority = _a.priority, due_date = _a.due_date;
    var newTodo = { title: title, description: description, status: status, priority: priority, due_date: due_date };
    db.query('INSERT INTO todos SET ?', newTodo, function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(__assign({ id: result.insertId }, newTodo));
    });
});
// Lesen aller Todos mit optionaler Paginierung und Filterung nach Fälligkeitsdatum
app.get('/api/todos', function (req, res) {
    var limit = parseInt(req.query.limit, 10) || 9999;
    var offset = parseInt(req.query.offset, 10) || 0;
    var dueDate = req.query.due_date;
    var query = 'SELECT * FROM todos';
    var queryParams = [];
    if (dueDate) {
        query += ' WHERE due_date = ?';
        queryParams.push(dueDate);
    }
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    db.query(query, queryParams, function (err, todosResults) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(todosResults);
    });
});
// Lesen eines einzelnen Todo nach ID
app.get('/api/todos/:id', function (req, res) {
    var id = req.params.id;
    db.query('SELECT * FROM todos WHERE id = ?', [id], function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length > 0) {
            res.json(result[0]);
        }
        else {
            res.status(404).send('Todo nicht gefunden');
        }
    });
});
// Aktualisieren eines bestehenden Todo nach ID
app.put('/api/todos/:id', function (req, res) {
    var id = req.params.id;
    var _a = req.body, title = _a.title, description = _a.description, status = _a.status, priority = _a.priority, due_date = _a.due_date, done = _a.done;
    var updatedTodo = { title: title, description: description, status: status, priority: priority, due_date: due_date, done: done };
    db.query('UPDATE todos SET ? WHERE id = ?', [updatedTodo, id], function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Todo aktualisiert');
    });
});
// Löschen eines Todo nach ID
app.delete('/api/todos/:id', function (req, res) {
    var id = req.params.id;
    db.query('DELETE FROM todos WHERE id = ?', [id], function (err, result) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Todo gelöscht');
    });
});
var port = process.env.PORT || 3000;
app.listen(port, function () { return console.log("Server l\u00E4uft auf Port ".concat(port)); });
