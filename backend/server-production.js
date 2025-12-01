const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Compression middleware for production
if (NODE_ENV === 'production') {
    app.use(compression());
}

// CORS configuration
const corsOptions = {
    origin: NODE_ENV === 'production' ? false : true, // Restrict in production
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection with error handling
const dbPath = path.join(__dirname, '../database/questioner.db');
let db;

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('Connected to SQLite database.');
                resolve();
            }
        });
    });
}

// Graceful error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        port: PORT
    });
});

// API Routes with error handling wrapper
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Get all categories
app.get('/api/categories', asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY name';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error occurred' });
            return;
        }
        res.json({ categories: rows });
    });
}));

// Search questions
app.get('/api/search', asyncHandler(async (req, res) => {
    const { q, category } = req.query;
    
    if (!q || q.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    let sql = `
        SELECT q.*, c.name as category_name 
        FROM questions_fts 
        JOIN questions q ON questions_fts.rowid = q.id 
        LEFT JOIN categories c ON q.category_id = c.id 
        WHERE questions_fts MATCH ?
    `;
    let params = [q.trim()];

    if (category && category !== 'all') {
        sql += ' AND q.category_id = ?';
        params.push(category);
    }

    sql += ' ORDER BY rank LIMIT 50';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Search error:', err);
            res.status(500).json({ error: 'Search error occurred' });
            return;
        }
        res.json({ questions: rows, total: rows.length });
    });
}));

// Get all questions with pagination
app.get('/api/questions', asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
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
            console.error('Count query error:', err);
            res.status(500).json({ error: 'Database error occurred' });
            return;
        }

        // Get questions
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Questions query error:', err);
                res.status(500).json({ error: 'Database error occurred' });
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
}));

// Get single question
app.get('/api/questions/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }

    const sql = `
        SELECT q.*, c.name as category_name 
        FROM questions q 
        LEFT JOIN categories c ON q.category_id = c.id 
        WHERE q.id = ?
    `;
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Question query error:', err);
            res.status(500).json({ error: 'Database error occurred' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json({ question: row });
    });
}));

// Add new question
app.post('/api/questions', asyncHandler(async (req, res) => {
    const { category_id, question_number, question_text, answer_text, keywords } = req.body;
    
    if (!question_text || !answer_text) {
        return res.status(400).json({ error: 'Question text and answer text are required' });
    }

    if (question_text.length > 5000 || answer_text.length > 10000) {
        return res.status(400).json({ error: 'Text content too long' });
    }

    const sql = `
        INSERT INTO questions (category_id, question_number, question_text, answer_text, keywords)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [category_id, question_number, question_text, answer_text, keywords], function(err) {
        if (err) {
            console.error('Insert question error:', err);
            res.status(500).json({ error: 'Failed to add question' });
            return;
        }
        res.json({
            message: 'Question added successfully',
            id: this.lastID
        });
    });
}));

// Update question
app.put('/api/questions/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }

    const { category_id, question_number, question_text, answer_text, keywords } = req.body;
    
    if (!question_text || !answer_text) {
        return res.status(400).json({ error: 'Question text and answer text are required' });
    }

    if (question_text.length > 5000 || answer_text.length > 10000) {
        return res.status(400).json({ error: 'Text content too long' });
    }

    const sql = `
        UPDATE questions 
        SET category_id = ?, question_number = ?, question_text = ?, answer_text = ?, keywords = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [category_id, question_number, question_text, answer_text, keywords, id], function(err) {
        if (err) {
            console.error('Update question error:', err);
            res.status(500).json({ error: 'Failed to update question' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json({ message: 'Question updated successfully' });
    });
}));

// Delete question
app.delete('/api/questions/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }

    const sql = 'DELETE FROM questions WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Delete question error:', err);
            res.status(500).json({ error: 'Failed to delete question' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json({ message: 'Question deleted successfully' });
    });
}));

// Add new category
app.post('/api/categories', asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    if (name.length > 100) {
        return res.status(400).json({ error: 'Category name too long' });
    }

    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    
    db.run(sql, [name.trim(), description], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Category name already exists' });
            } else {
                console.error('Insert category error:', err);
                res.status(500).json({ error: 'Failed to add category' });
            }
            return;
        }
        res.json({
            message: 'Category added successfully',
            id: this.lastID
        });
    });
}));

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        
        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${NODE_ENV}`);
            console.log(`Process ID: ${process.pid}`);
        });

        // Graceful shutdown handling
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        
        function gracefulShutdown() {
            console.log('\nShutting down server...');
            server.close(() => {
                console.log('HTTP server closed.');
                if (db) {
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err.message);
                        } else {
                            console.log('Database connection closed.');
                        }
                        process.exit(0);
                    });
                } else {
                    process.exit(0);
                }
            });
        }

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();
