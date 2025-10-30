// Global variables
let currentPage = 1;
let currentCategory = 'all';
let categories = [];

// API base URL
const API_BASE = '/api';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryFilter = document.getElementById('category-filter');
const searchResults = document.getElementById('search-results');
const resultsContainer = document.getElementById('results-container');
const resultsCount = document.getElementById('results-count');
const loading = document.getElementById('loading');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize application
async function initializeApp() {
    await loadCategories();
    setupNavigation();
    setupAdminTabs();
    loadBrowseQuestions();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Category filter
    categoryFilter.addEventListener('change', performSearch);
    
    // Browse category filter
    const browseCategoryFilter = document.getElementById('browse-category-filter');
    browseCategoryFilter.addEventListener('change', function() {
        currentPage = 1;
        loadBrowseQuestions();
    });
    
    // Admin forms
    const addQuestionForm = document.getElementById('add-question-form');
    const addCategoryForm = document.getElementById('add-category-form');
    
    addQuestionForm.addEventListener('submit', handleAddQuestion);
    addCategoryForm.addEventListener('submit', handleAddCategory);
    
    // Manage section filters
    const manageCategoryFilter = document.getElementById('manage-category-filter');
    const manageSearch = document.getElementById('manage-search');
    
    if (manageCategoryFilter) {
        manageCategoryFilter.addEventListener('change', loadManageQuestions);
    }
    
    if (manageSearch) {
        let debounceTimer;
        manageSearch.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadManageQuestions();
            }, 300);
        });
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.dataset.page;
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${targetPage}-page`).classList.add('active');
            
            // Load page-specific data
            if (targetPage === 'browse') {
                loadBrowseQuestions();
            } else if (targetPage === 'admin') {
                loadAdminData();
            }
        });
    });
}

// Setup admin tabs
function setupAdminTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show target tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();
        categories = data.categories;
        
        // Populate category filters
        populateCategoryFilters();
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Error loading categories', 'error');
    }
}

// Populate category filters
function populateCategoryFilters() {
    const filters = [
        categoryFilter,
        document.getElementById('browse-category-filter'),
        document.getElementById('question-category'),
        document.getElementById('manage-category-filter')
    ];
    
    filters.forEach(filter => {
        if (filter) {
            // Clear existing options (except "All Categories" for filters)
            const isFilter = filter.id.includes('filter');
            filter.innerHTML = isFilter ? '<option value="all">All Categories</option>' : '<option value="">Select a category</option>';
            
            // Add category options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                filter.appendChild(option);
            });
        }
    });
}

// Perform search
async function performSearch() {
    const query = searchInput.value.trim();
    const category = categoryFilter.value;
    
    if (!query) {
        searchResults.style.display = 'none';
        return;
    }
    
    showLoading();
    
    try {
        const params = new URLSearchParams({
            q: query,
            category: category
        });
        
        const response = await fetch(`${API_BASE}/search?${params}`);
        const data = await response.json();
        
        displaySearchResults(data.questions, data.total);
        searchResults.style.display = 'block';
    } catch (error) {
        console.error('Error performing search:', error);
        showToast('Error performing search', 'error');
    } finally {
        hideLoading();
    }
}

// Display search results
function displaySearchResults(questions, total) {
    resultsCount.textContent = `${total} result${total !== 1 ? 's' : ''} found`;
    resultsContainer.innerHTML = '';
    
    if (questions.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No questions found matching your search.</div>';
        return;
    }
    
    questions.forEach(question => {
        const questionCard = createQuestionCard(question);
        resultsContainer.appendChild(questionCard);
    });
}

// Create question card
function createQuestionCard(question) {
    const card = document.createElement('div');
    card.className = 'question-card';
    
    card.innerHTML = `
        <div class="question-header">
            ${question.question_number ? `<span class="question-number">${question.question_number}</span>` : ''}
            <span class="category-badge">${question.category_name || 'Uncategorized'}</span>
        </div>
        <div class="question-text">${escapeHtml(question.question_text)}</div>
        <div class="answer-text">${escapeHtml(question.answer_text)}</div>
    `;
    
    return card;
}

// Load browse questions
async function loadBrowseQuestions(page = 1) {
    const category = document.getElementById('browse-category-filter').value;
    
    showLoading();
    
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10,
            category: category
        });
        
        const response = await fetch(`${API_BASE}/questions?${params}`);
        const data = await response.json();
        
        displayBrowseResults(data.questions);
        updateBrowseInfo(data.pagination);
        createPagination(data.pagination);
        
        currentPage = page;
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('Error loading questions', 'error');
    } finally {
        hideLoading();
    }
}

// Display browse results
function displayBrowseResults(questions) {
    const browseResults = document.getElementById('browse-results');
    browseResults.innerHTML = '';
    
    if (questions.length === 0) {
        browseResults.innerHTML = '<div class="no-results">No questions found.</div>';
        return;
    }
    
    questions.forEach(question => {
        const questionCard = createQuestionCard(question);
        browseResults.appendChild(questionCard);
    });
}

// Update browse info
function updateBrowseInfo(pagination) {
    const browseInfo = document.getElementById('browse-info');
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    
    browseInfo.textContent = `Showing ${start}-${end} of ${pagination.total} questions`;
}

// Create pagination
function createPagination(pagination) {
    const paginationContainer = document.getElementById('browse-pagination');
    paginationContainer.innerHTML = '';
    
    if (pagination.pages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = pagination.page === 1;
    prevBtn.addEventListener('click', () => loadBrowseQuestions(pagination.page - 1));
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === pagination.page ? 'active' : '';
        pageBtn.addEventListener('click', () => loadBrowseQuestions(i));
        paginationContainer.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = pagination.page === pagination.pages;
    nextBtn.addEventListener('click', () => loadBrowseQuestions(pagination.page + 1));
    paginationContainer.appendChild(nextBtn);
}

// Load admin data
function loadAdminData() {
    // Load categories for admin forms
    populateCategoryFilters();
    // Load questions for management
    loadManageQuestions();
}

// Handle add question form
async function handleAddQuestion(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const questionData = {
        category_id: formData.get('category_id') || null,
        question_number: formData.get('question_number'),
        question_text: formData.get('question_text'),
        answer_text: formData.get('answer_text'),
        keywords: formData.get('keywords')
    };
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Question added successfully!', 'success');
            e.target.reset();
        } else {
            showToast(data.error || 'Error adding question', 'error');
        }
    } catch (error) {
        console.error('Error adding question:', error);
        showToast('Error adding question', 'error');
    } finally {
        hideLoading();
    }
}

// Handle add category form
async function handleAddCategory(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const categoryData = {
        name: formData.get('name'),
        description: formData.get('description')
    };
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Category added successfully!', 'success');
            e.target.reset();
            await loadCategories(); // Reload categories
        } else {
            showToast(data.error || 'Error adding category', 'error');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showToast('Error adding category', 'error');
    } finally {
        hideLoading();
    }
}

// Utility functions
function showLoading() {
    loading.style.display = 'flex';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search suggestions (optional enhancement)
function setupSearchSuggestions() {
    let debounceTimer;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = this.value.trim();
            if (query.length >= 2) {
                // Could implement search suggestions here
                // For now, we'll just perform the search
                performSearch();
            } else {
                searchResults.style.display = 'none';
            }
        }, 300);
    });
}

// Load manage questions
async function loadManageQuestions() {
    const category = document.getElementById('manage-category-filter').value;
    const searchTerm = document.getElementById('manage-search').value;
    
    showLoading();
    
    try {
        let url = `${API_BASE}/questions?limit=50`;
        if (category && category !== 'all') {
            url += `&category=${category}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        let questions = data.questions;
        
        // Filter by search term if provided
        if (searchTerm) {
            questions = questions.filter(q => 
                q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.answer_text.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        displayManageQuestions(questions);
    } catch (error) {
        console.error('Error loading manage questions:', error);
        showToast('Error loading questions', 'error');
    } finally {
        hideLoading();
    }
}

// Display manage questions
function displayManageQuestions(questions) {
    const manageResults = document.getElementById('manage-results');
    manageResults.innerHTML = '';
    
    if (questions.length === 0) {
        manageResults.innerHTML = '<div class="no-results">No questions found.</div>';
        return;
    }
    
    questions.forEach(question => {
        const questionCard = createManageQuestionCard(question);
        manageResults.appendChild(questionCard);
    });
}

// Create manage question card
function createManageQuestionCard(question) {
    const card = document.createElement('div');
    card.className = 'manage-question-card';
    
    card.innerHTML = `
        <div class="manage-question-content">
            <div class="manage-question-title">
                ${question.question_number ? `Q${question.question_number}: ` : ''}${escapeHtml(question.question_text.substring(0, 100))}${question.question_text.length > 100 ? '...' : ''}
            </div>
            <div class="manage-question-meta">
                Category: ${question.category_name || 'Uncategorized'} | 
                Answer: ${escapeHtml(question.answer_text.substring(0, 50))}${question.answer_text.length > 50 ? '...' : ''}
            </div>
        </div>
        <div class="manage-question-actions">
            <button class="btn btn-sm btn-primary" onclick="editQuestion(${question.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${question.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

// Edit question function
async function editQuestion(questionId) {
    try {
        const response = await fetch(`${API_BASE}/questions/${questionId}`);
        const data = await response.json();
        
        if (response.ok) {
            showEditModal(data.question);
        } else {
            showToast('Error loading question details', 'error');
        }
    } catch (error) {
        console.error('Error loading question:', error);
        showToast('Error loading question', 'error');
    }
}

// Show edit modal
function showEditModal(question) {
    // Create modal HTML
    const modalHTML = `
        <div id="edit-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Question</h3>
                    <button class="modal-close" onclick="closeEditModal()">&times;</button>
                </div>
                <form id="edit-question-form">
                    <input type="hidden" id="edit-question-id" value="${question.id}">
                    <div class="form-group">
                        <label for="edit-question-category">Category</label>
                        <select id="edit-question-category" name="category_id" required>
                            <option value="">Select a category</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-question-number">Question Number</label>
                        <input type="text" id="edit-question-number" name="question_number" value="${question.question_number || ''}" placeholder="e.g., 1.0, 2.1">
                    </div>
                    <div class="form-group">
                        <label for="edit-question-text">Question</label>
                        <textarea id="edit-question-text" name="question_text" rows="4" required>${escapeHtml(question.question_text)}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-answer-text">Answer</label>
                        <textarea id="edit-answer-text" name="answer_text" rows="4" required>${escapeHtml(question.answer_text)}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-keywords">Keywords</label>
                        <input type="text" id="edit-keywords" name="keywords" value="${question.keywords || ''}" placeholder="Enter keywords separated by spaces">
                        <small>Keywords help improve search results</small>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Populate categories in edit form
    const editCategorySelect = document.getElementById('edit-question-category');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        option.selected = category.id === question.category_id;
        editCategorySelect.appendChild(option);
    });
    
    // Add form submit handler
    document.getElementById('edit-question-form').addEventListener('submit', handleEditQuestion);
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.remove();
    }
}

// Handle edit question form
async function handleEditQuestion(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const questionId = formData.get('question_id') || document.getElementById('edit-question-id').value;
    const questionData = {
        category_id: formData.get('category_id') || null,
        question_number: formData.get('question_number'),
        question_text: formData.get('question_text'),
        answer_text: formData.get('answer_text'),
        keywords: formData.get('keywords')
    };
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/questions/${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Question updated successfully!', 'success');
            closeEditModal();
            loadManageQuestions(); // Reload the questions list
        } else {
            showToast(data.error || 'Error updating question', 'error');
        }
    } catch (error) {
        console.error('Error updating question:', error);
        showToast('Error updating question', 'error');
    } finally {
        hideLoading();
    }
}

// Delete question function
async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/questions/${questionId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Question deleted successfully!', 'success');
            loadManageQuestions(); // Reload the questions list
        } else {
            showToast(data.error || 'Error deleting question', 'error');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        showToast('Error deleting question', 'error');
    } finally {
        hideLoading();
    }
}

// Initialize search suggestions
// setupSearchSuggestions();
