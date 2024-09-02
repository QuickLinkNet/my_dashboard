-- Erstellt die Tabelle für Layouts, falls sie noch nicht existiert
CREATE TABLE IF NOT EXISTS layouts (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        layout TEXT NOT NULL
);

-- Erstellt die Tabelle für Prompts, falls sie noch nicht existiert
CREATE TABLE IF NOT EXISTS prompts (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        title VARCHAR(255) NOT NULL,
                                        prompt TEXT NOT NULL,
                                        keywords TEXT,
                                        expected_runs NUMERIC NOT NULL,
                                        successful_runs NUMERIC NOT NULL
);

-- Erstellt die Tabelle für Todos, falls sie noch nicht existiert
CREATE TABLE IF NOT EXISTS todos (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        title VARCHAR(255) NOT NULL,
                                        description TEXT,
                                        status ENUM('pending', 'in progress', 'completed') DEFAULT 'pending',
                                        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                                        due_date DATE,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        done BOOLEAN DEFAULT FALSE -- Hinzufügen des 'done' Feldes
);

-- Wenn die Tabelle schon existiert, aber das 'done' Feld fehlt, hinzufügen
ALTER TABLE todos ADD COLUMN IF NOT EXISTS done BOOLEAN DEFAULT FALSE;

-- Erstellt die Tabelle für Erfolgsstatistiken, falls sie noch nicht existiert
CREATE TABLE IF NOT EXISTS prompt_success_logs (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        prompt_id INT(10) UNSIGNED NOT NULL,
                                        success_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);
