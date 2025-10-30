-- Database schema for Questioner App
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    question_number VARCHAR(10),
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    keywords TEXT, -- Space-separated keywords for better search
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create full-text search index for better search performance
CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts USING fts5(
    question_text,
    answer_text,
    keywords,
    content='questions',
    content_rowid='id'
);

-- Trigger to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS questions_ai AFTER INSERT ON questions BEGIN
    INSERT INTO questions_fts(rowid, question_text, answer_text, keywords)
    VALUES (new.id, new.question_text, new.answer_text, new.keywords);
END;

CREATE TRIGGER IF NOT EXISTS questions_ad AFTER DELETE ON questions BEGIN
    INSERT INTO questions_fts(questions_fts, rowid, question_text, answer_text, keywords)
    VALUES('delete', old.id, old.question_text, old.answer_text, old.keywords);
END;

CREATE TRIGGER IF NOT EXISTS questions_au AFTER UPDATE ON questions BEGIN
    INSERT INTO questions_fts(questions_fts, rowid, question_text, answer_text, keywords)
    VALUES('delete', old.id, old.question_text, old.answer_text, old.keywords);
    INSERT INTO questions_fts(rowid, question_text, answer_text, keywords)
    VALUES (new.id, new.question_text, new.answer_text, new.keywords);
END;

-- Insert initial categories
INSERT OR IGNORE INTO categories (name, description) VALUES 
('Privacy and Info Security - General', 'General privacy and information security questions'),
('Policies and Privacy Program', 'Questions about policies, procedures, and privacy programs'),
('Internal Access', 'Questions about internal access controls and procedures'),
('Security Controls', 'Technical security controls and measures'),
('Physical Safeguards', 'Physical security measures and safeguards'),
('Operations in the EU & ROW', 'European Union and Rest of World operations'),
('Information Sharing to Other Third Parties', 'Third-party information sharing policies');
