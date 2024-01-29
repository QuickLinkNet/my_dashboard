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
