# Todays News Aggregator

A premium, modern news aggregator web application with real-time RSS feed crawling, intelligent categorization, **User Authentication**, and **Personalized Bookmarks**. Built with React + Vite on the frontend, Node.js + Express on the backend, and MongoDB Atlas for database storage.

---

## 🌟 Key Features

*   **User Authentication:** Secure user registration and login with bcrypt password hashing and JWT authentication tokens.
*   **Personalized Bookmarks:** Save news articles to your reading list with duplicate prevention and user isolation.
*   **Automated Feed Synchronization:** Scrapes top news sources on an automated 3-hour interval, with support for on-demand manual sync.
*   **Intelligent Auto-Categorization:** Parses RSS metadata to categorize stories into *Politics, Sports, Business, Entertainment, International,* and *Top Stories*.
*   **MongoDB Atlas Storage & Deduplication:** Prevents article duplication, auto-upgrades categories, and automatically purges content older than 3 days.
*   **Fluid, Premium Responsive UI:** Glassmorphic dark theme built with custom Inter typography, micro-interactions, responsive grid, dynamic navigation, and category placeholders.
*   **Global & Regional Feeds:** Built-in regional toggles for **Global** and **India** news sources.

---

## 📁 Repository Structure

```text
todays-news-aggregator/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # MongoDB user schema
│   │   └── Bookmark.js       # MongoDB bookmark schema
│   ├── routes/
│   │   ├── auth.js           # Authentication API routes (register, login, me)
│   │   └── bookmarks.js      # Bookmark management API routes
│   ├── news-store.js         # DB operations, deduplication, and categorization logic
│   ├── sources.js            # RSS feed source configurations
│   ├── server.js             # Express server & RSS cron syncer
│   └── package.json          # Express, Mongoose, bcryptjs, jsonwebtoken, rss-parser
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # React UI, Auth state, Views & Bookmark toggle
│   │   ├── App.css           # Glassmorphic dark styling & responsive design
│   │   └── main.jsx          # Entry point
│   ├── index.html            # HTML entry
│   └── package.json          # React, Vite dependencies
├── Dockerfile                # Multi-stage Docker build config
├── package.json              # Monorepo management scripts
└── README.md                 # Project documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or in `backend/`) containing:

```env
PORT=5000
MONGODB_URI=<your MongoDB Atlas connection URI>
JWT_SECRET=<your secure JWT secret string>
```

> ⚠️ **Security Notice:** Never commit `.env` or hardcode actual secrets into source code. Use placeholders for deployment scripts.

---

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18.0.0 or higher)
*   npm (v9.0.0 or higher)
*   MongoDB Atlas instance (or local MongoDB database)

### 1. Install Dependencies

Install dependencies for both backend and frontend:

```bash
npm run install:all
```

### 2. Run in Development Mode

#### Start Backend
```bash
cd backend
npm run dev
```

#### Start Frontend
In a separate terminal window:
```bash
cd frontend
npm run dev
```

### 3. Build & Run Locally
```bash
npm run build:all
npm start
```
Access the application at `http://localhost:5000`.

---

## 🐳 Docker Deployment

The application is containerized using Docker with multi-stage builds.

### Build Docker Image
```bash
docker build -t news-aggregator .
```

### Run Docker Container
```bash
docker run -d -p 5000:5000 --env-file .env --name news-app news-aggregator
```

---

## 📡 API Reference

### Authentication Endpoints

#### `POST /api/auth/register`
*   **Body:** `{ "name": "John Doe", "email": "john@example.com", "password": "secretpassword", "confirmPassword": "secretpassword" }`
*   **Response:** JWT token & user profile object.

#### `POST /api/auth/login`
*   **Body:** `{ "email": "john@example.com", "password": "secretpassword" }`
*   **Response:** JWT token & user profile object.

#### `GET /api/auth/me` *(Protected)*
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Response:** Currently authenticated user details (excluding password hash).

---

### Bookmarks Endpoints *(All Protected)*

#### `GET /api/bookmarks`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Response:** List of saved bookmarks for the authenticated user.

#### `POST /api/bookmarks`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Body:** `{ "articleId": "guid-or-url", "title": "Article Title", "description": "...", "url": "https://...", "image": "...", "source": "...", "category": "..." }`
*   **Response:** Saved bookmark document.

#### `GET /api/bookmarks/:articleId`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Response:** `{ "isBookmarked": true|false, "bookmark": object|null }`

#### `DELETE /api/bookmarks/:articleId`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Response:** `{ "message": "Bookmark removed successfully", "articleId": "..." }`

---

### News & Scraper Endpoints

#### `GET /api/news`
Fetches cached articles with filtering (`category`, `region`, `source`, `search`, `importantOnly`, `page`, `limit`).

#### `GET /api/sources`
Retrieves list of news publications.

#### `GET /api/status`
Retrieves live scraper operational status.

#### `POST /api/trigger-sync`
Triggers an immediate RSS feed refresh cycle.
