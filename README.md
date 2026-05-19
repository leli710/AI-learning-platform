# AI-Driven Learning Platform (Mini MVP)

A full-stack learning platform that allows users to select topics by category and sub-category, send prompts to an AI to receive generated lessons, and view their learning history.

## Technologies Used

**Backend**
- Node.js + TypeScript
- Express.js (REST API)
- MongoDB + Mongoose (ODM)
- OpenAI GPT API (gpt-4o)
- bcrypt (password hashing)
- nodemailer (email delivery)
- dotenv

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- html2pdf.js
- lucide-react

## Project Structure

```
learning-platform project/
├── backend/
│   └── src/
│       ├── controllers/   # Route handlers
│       ├── models/        # Mongoose schemas
│       ├── routes/        # Express routers
│       ├── services/      # AI service (OpenAI)
│       └── utils/         # Validators
├── client/
│   └── src/
│       ├── api/           # Axios API calls
│       └── pages/         # React pages
└── docker-compose.yml
```

## Assumptions Made

- Authentication uses a single `/login` endpoint that handles both login and registration (detects by email existence).
- Israeli ID validation is enforced on registration.
- OpenAI API failures fall back to a simulated lesson response to ensure the app remains functional.
- The Admin dashboard at `/admin` is protected by a secret key (`ADMIN_SECRET` in `.env`). No JWT in this MVP — can be upgraded as a bonus.

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key
- Gmail account with App Password enabled

### 1. Clone the repository
git clone (https://github.com/leli710/AI-learning-platform)
cd learning-platform-project

### 2. Backend setup
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev


### 3. Create the admin user (first time only)
cd backend
npm run seed:admin

This creates an admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`.
The admin can then log in at the regular `/login` page and will see the **Admin** button in the dashboard.

### 4. Frontend setup
cd client
npm install
npm run dev

### 5. Run with Docker (optional)
# From the project root
docker-compose up --build

## Running Locally

| Service  | URL                        |
|----------|----------------------------|
| Backend  | http://localhost:5000       |
| Frontend | http://localhost:5173       |
| Admin    | http://localhost:5173/admin |

## API Endpoints

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | /api/users/login                  | Login or Register              |
| GET    | /api/users/admin/all              | List all users (admin)         |
| GET    | /api/categories                   | Get all categories             |
| POST   | /api/categories                   | Create category                |
| GET    | /api/categories/subcategories     | Get all sub-categories         |
| GET    | /api/categories/sub/:categoryId   | Get sub-categories by parent   |
| POST   | /api/categories/sub               | Create sub-category            |
| POST   | /api/categories/sub/:id/learn     | Generate AI learning plan      |
| POST   | /api/prompts/generate             | Generate AI lesson             |
| GET    | /api/prompts/history/:userId      | Get user learning history      |
| POST   | /api/prompts/send-email           | Send lesson to email           |
| GET    | /api/courses                      | Get all courses                |
| POST   | /api/courses                      | Create course                  |

## Sample .env

See `backend/.env.example` for all required environment variables.
