const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

const DB_FILE = './books.json';

const DEFAULT_BOOKS = [
  { id: 1, title: 'The Hobbit',  author: 'J.R.R. Tolkien',  year: 1937 },
  { id: 2, title: 'Dune',        author: 'Frank Herbert',    year: 1965 },
  { id: 3, title: '1984',        author: 'George Orwell',    year: 1949 }
];

let books = fs.existsSync(DB_FILE)
  ? JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  : [...DEFAULT_BOOKS];

function saveBooks() {
  fs.writeFileSync(DB_FILE, JSON.stringify(books, null, 2));
}

function validateBookFields({ title, author, year }, requireAll = true) {
  const errors = [];

  if (requireAll || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('title must be a non-empty string');
    }
  }
  if (requireAll || author !== undefined) {
    if (!author || typeof author !== 'string' || author.trim() === '') {
      errors.push('author must be a non-empty string');
    }
  }
  if (requireAll || year !== undefined) {
    if (year === undefined || year === null) {
      errors.push('year is required');
    } else if (typeof year !== 'number' || !Number.isInteger(year) || year < 0 || year > new Date().getFullYear()) {
      errors.push(`year must be an integer between 0 and ${new Date().getFullYear()}`);
    }
  }

  return errors;
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Book Collection API' });
});

app.get('/books', (req, res) => {
  let result = books;

  if (req.query.author) {
    result = result.filter(b =>
      b.author.toLowerCase().includes(req.query.author.toLowerCase())
    );
  }
  if (req.query.title) {
    result = result.filter(b =>
      b.title.toLowerCase().includes(req.query.title.toLowerCase())
    );
  }
  if (req.query.year) {
    const year = parseInt(req.query.year);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'year query param must be a number' });
    }
    result = result.filter(b => b.year === year);
  }

  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1) {
    return res.status(400).json({ error: 'page and limit must be positive integers' });
  }

  const start = (page - 1) * limit;

  res.json({
    total: result.length,
    page,
    limit,
    data: result.slice(start, start + limit)
  });
});

app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

app.post('/books', (req, res) => {
  const { title, author, year } = req.body;

  const errors = validateBookFields({ title, author, year }, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newBook = {
    id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
    title: title.trim(),
    author: author.trim(),
    year
  };

  books.push(newBook);
  saveBooks();
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { title, author, year } = req.body;

  const errors = validateBookFields({ title, author, year }, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  book.title  = title.trim();
  book.author = author.trim();
  book.year   = year;

  saveBooks();
  res.json(book);
});

app.patch('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { title, author, year } = req.body;

  const errors = validateBookFields({ title, author, year }, false);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (title  !== undefined) book.title  = title.trim();
  if (author !== undefined) book.author = author.trim();
  if (year   !== undefined) book.year   = year;

  saveBooks();
  res.json(book);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  books.splice(index, 1);
  saveBooks();
  res.json({ message: 'Book deleted successfully' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Book API running at http://localhost:${port}`);
});