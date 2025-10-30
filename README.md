# Questioner - Security Questions & Answers Database

A modern web application for searching and managing security questions and answers with a WordPress-inspired design. Built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

- **🔍 Advanced Search**: Full-text search across questions and answers with keyword matching
- **📂 Category Filtering**: Browse questions by categories (UBC, BMO, Privacy, Security, etc.)
- **📱 Responsive Design**: WordPress-inspired modern UI that works on all devices
- **⚡ Fast Performance**: SQLite database with FTS (Full-Text Search) for lightning-fast queries
- **🛠️ Admin Panel**: Add new questions, categories, and manage existing content
- **📄 Pagination**: Efficient browsing with paginated results
- **🎨 Beautiful UI**: Clean, professional design with smooth animations

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with FTS5 (Full-Text Search)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with WordPress-inspired design
- **Icons**: Font Awesome 6

## Project Structure

```
questioner-app/
├── backend/
│   ├── server.js              # Express server and API routes
│   ├── package.json           # Backend dependencies
│   └── scripts/
│       └── init-db.js         # Database initialization script
├── database/
│   ├── schema.sql             # Database schema
│   ├── seed_data.sql          # UBC security questions
│   ├── bmo_seed_data.sql      # BMO security questions
│   └── questioner.db          # SQLite database (generated)
└── frontend/
    ├── index.html             # Main HTML file
    ├── styles.css             # CSS styles
    └── script.js              # JavaScript functionality
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Step 1: Install Dependencies
```bash
cd questioner-app/backend
npm install
```

### Step 2: Initialize Database
```bash
npm run init-db
```

### Step 3: Start the Server
```bash
npm start
```

The application will be available at: **http://localhost:3000**

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add new category

### Questions
- `GET /api/questions` - Get paginated questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Add new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Search
- `GET /api/search?q=query&category=id` - Search questions

## Usage Guide

### 🔍 Search Page
1. Enter keywords in the search box
2. Optionally filter by category
3. Press Enter or click Search button
4. View results with highlighted matches

### 📖 Browse Page
1. Select a category filter (optional)
2. Browse through paginated results
3. Use pagination controls to navigate

### ⚙️ Admin Panel
1. **Add Question**: Fill out the form with question details
2. **Add Category**: Create new categories for organization
3. **Manage Questions**: View and edit existing questions

## Database Schema

### Categories Table
- `id` - Primary key
- `name` - Category name (unique)
- `description` - Category description
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Questions Table
- `id` - Primary key
- `category_id` - Foreign key to categories
- `question_number` - Question identifier (e.g., "1.0", "2.1")
- `question_text` - The question content
- `answer_text` - The answer content
- `keywords` - Space-separated keywords for search
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Full-Text Search
The application uses SQLite's FTS5 extension for advanced search capabilities:
- Searches across question text, answer text, and keywords
- Supports phrase matching and boolean operators
- Automatic ranking of results by relevance

## Data Sources

The application includes security questions from:
- **UBC Security Questions**: Comprehensive security assessment questions
- **BMO Security Questions**: Banking and financial security questions
- Categories include:
  - Privacy and Information Security
  - Legal and Regulatory Framework
  - Governance Structure
  - Security Controls
  - Physical Safeguards
  - Risk Assessment
  - Fraud Risk Management
  - And more...

## Features in Detail

### Search Functionality
- **Real-time search** as you type
- **Category filtering** to narrow results
- **Keyword highlighting** in results
- **Relevance ranking** using SQLite FTS5

### WordPress-Inspired Design
- **Modern gradient headers** with sticky navigation
- **Card-based layouts** for easy reading
- **Responsive grid system** that adapts to screen size
- **Smooth animations** and hover effects
- **Professional color scheme** with accessibility in mind

### Admin Features
- **Form validation** for data integrity
- **Toast notifications** for user feedback
- **Category management** for organization
- **Bulk operations** support

## Customization

### Adding New Categories
1. Go to Admin Panel → Add Category
2. Enter category name and description
3. Submit the form

### Adding New Questions
1. Go to Admin Panel → Add Question
2. Select category, enter question number
3. Fill in question text and answer
4. Add relevant keywords for better search
5. Submit the form

### Styling Customization
Edit `frontend/styles.css` to customize:
- Colors and gradients
- Typography and fonts
- Layout and spacing
- Animations and effects

## Performance Optimization

- **SQLite FTS5** for fast full-text search
- **Pagination** to handle large datasets
- **Debounced search** to reduce API calls
- **Efficient CSS** with minimal external dependencies
- **Optimized images** and icons

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for efficient security question management**
