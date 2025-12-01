const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection
const dbPath = path.join(__dirname, '../database/questioner.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    });
});

// Get all categories
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY name';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ categories: rows });
    });
});

// Search questions
app.get('/api/search', (req, res) => {
    const { q, category } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    let sql = `
        SELECT q.*, c.name as category_name 
        FROM questions_fts 
        JOIN questions q ON questions_fts.rowid = q.id 
        LEFT JOIN categories c ON q.category_id = c.id 
        WHERE questions_fts MATCH ?
    `;
    let params = [q];

    if (category && category !== 'all') {
        sql += ' AND q.category_id = ?';
        params.push(category);
    }

    sql += ' ORDER BY rank LIMIT 50';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ questions: rows, total: rows.length });
    });
});

// Get all questions with pagination
app.get('/api/questions', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    let sql = `
        SELECT q.*, c.name as category_name 
        FROM questions q 
        LEFT JOIN categories c ON q.category_id = c.id
    `;
    let countSql = 'SELECT COUNT(*) as total FROM questions q';
    let params = [];

    if (category && category !== 'all') {
        sql += ' WHERE q.category_id = ?';
        countSql += ' WHERE q.category_id = ?';
        params.push(category);
    }

    sql += ' ORDER BY q.id LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Get total count
    db.get(countSql, category && category !== 'all' ? [category] : [], (err, countRow) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Get questions
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                questions: rows,
                pagination: {
                    page,
                    limit,
                    total: countRow.total,
                    pages: Math.ceil(countRow.total / limit)
                }
            });
        });
    });
});

// Get single question
app.get('/api/questions/:id', (req, res) => {
    const sql = `
        SELECT q.*, c.name as category_name 
        FROM questions q 
        LEFT JOIN categories c ON q.category_id = c.id 
        WHERE q.id = ?
    `;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json({ question: row });
    });
});

// Add new question
app.post('/api/questions', (req, res) => {
    const { category_id, question_number, question_text, answer_text, keywords } = req.body;
    
    if (!question_text || !answer_text) {
        return res.status(400).json({ error: 'Question text and answer text are required' });
    }

    const sql = `
        INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [category_id, question_number, question_text, answer_text, keywords], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Question added successfully',
            id: this.lastID
        });
    });
});

// Update question
app.put('/api/questions/:id', (req, res) => {
    const { category_id, question_number, question_text, answer_text, keywords } = req.body;
    
    if (!question_text || !answer_text) {
        return res.status(400).json({ error: 'Question text and answer text are required' });
    }

    const sql = `
        UPDATE questions 
        SET category_id = ?, question_number = ?, question_text = ?, answer_text = ?, keywords = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [category_id, question_number, question_text, answer_text, keywords, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json({ message: 'Question updated successfully' });
    });
});

// Delete question
app.delete('/api/questions/:id', (req, res) => {
    const sql = 'DELETE FROM questions WHERE id = ?';
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json({ message: 'Question deleted successfully' });
    });
});

// Add new category
app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    
    db.run(sql, [name, description], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Category name already exists' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        res.json({
            message: 'Category added successfully',
            id: this.lastID
        });
    });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
