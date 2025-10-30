const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../../database/questioner.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');
const seedPath = path.join(__dirname, '../../database/seed_data.sql');
const bmoSeedPath = path.join(__dirname, '../../database/bmo_seed_data.sql');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to SQLite database.');
});

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
const correctedSeedData = fs.readFileSync(path.join(__dirname, '../../database/corrected_seed_data.sql'), 'utf8');
const additionalBmoData = fs.readFileSync(path.join(__dirname, '../../database/additional_bmo_questions.sql'), 'utf8');

// Execute schema
db.exec(schema, (err) => {
    if (err) {
        console.error('Error executing schema:', err.message);
        return;
    }
    console.log('Database schema created successfully.');
    
    // Execute corrected seed data with exact questions
    db.exec(correctedSeedData, (err) => {
        if (err) {
            console.error('Error seeding corrected data:', err.message);
            return;
        }
        console.log('Corrected data seeded successfully with exact questions from Excel and screenshots.');
        
        // Execute additional BMO questions
        db.exec(additionalBmoData, (err) => {
            if (err) {
                console.error('Error seeding additional BMO data:', err.message);
                return;
            }
            console.log('Additional detailed BMO questions seeded successfully.');
            
            // Close database connection
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                    return;
                }
                console.log('Database initialization completed with all questions.');
            });
        });
    });
});
