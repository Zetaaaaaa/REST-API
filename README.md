# Book Collection API

A simple REST API built with Node.js and Express for managing a book collection. Supports full CRUD operations, filtering, pagination, and persistent storage.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed

### Installation

```bash
git clone https://github.com/Zetaaaaaa/REST-API.git
cd REST-API
npm install
node index.js
```

The server will start at `http://localhost:3000`

---

## API Endpoints

### Base
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | Get all books |
| GET | `/books/:id` | Get a single book by ID |
| POST | `/books` | Add a new book |
| PUT | `/books/:id` | Fully update a book |
| PATCH | `/books/:id` | Partially update a book |
| DELETE | `/books/:id` | Delete a book |

---

## Filtering & Pagination

Filter results using query parameters:

```
GET /books?author=tolkien
GET /books?title=hobbit
GET /books?year=1937
GET /books?page=1&limit=5
```

---

## Request & Response Examples

### POST /books
**Request body:**
```json
{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "year": 1937
}
```
**Response `201`:**
```json
{
  "id": 4,
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "year": 1937
}
```

### PATCH /books/:id
Only send the fields you want to update:
```json
{
  "year": 2024
}
```

### GET /books (paginated)
```json
{
  "total": 13,
  "page": 1,
  "limit": 5,
  "data": [ ... ]
}
```

---

## Validation Rules

- `title` — required, non-empty string
- `author` — required, non-empty string
- `year` — required, integer between 0 and current year

Invalid requests return `400` with an `errors` array:
```json
{
  "errors": ["year must be an integer between 0 and 2026"]
}
```

---

## Data Persistence

Books are saved to a local `books.json` file automatically on every write operation. The file is created on the first POST/PUT/PATCH/DELETE — no setup needed.

> `books.json` is excluded from version control via `.gitignore`.

---

## Tech Stack

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)

---

## Project Structure

```
REST-API/
├── index.js        # Main server file
├── package.json
├── .gitignore
└── books.json      # Auto-generated, not tracked by Git
```
