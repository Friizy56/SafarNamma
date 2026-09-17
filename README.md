# RoamLocal 🌍

RoamLocal is a modern full-stack travel and local exploration platform that helps travelers discover hidden gems, join travel groups, explore curated weekend getaways, and share authentic community reviews.

---

## 🚀 Features

- **Explore Hidden Gems & Destinations**: Filter destinations by category, state, budget tiers, and search query.
- **Weekend Getaways**: Curated recommendations for quick weekend trips.
- **Travel Groups**: Create and join travel groups for shared adventures.
- **Interactive Map & Directions**: Visual integration with map links and coordinates.
- **User Submissions**: Users can submit new places with images (powered by Cloudinary) and descriptions.
- **Admin Dashboard**: Review, approve, or reject user-submitted places.
- **Google Authentication**: Seamless sign-in with Google OAuth.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Modern CSS / Lucide React icons
- **State & Routing**: React Router DOM
- **Media**: Cloudinary integration for image uploads
- **Auth**: `@react-oauth/google`

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM & Database**: SQLAlchemy with SQLite
- **Validation**: Pydantic v2
- **Auth**: Google Auth verification

---

## 📂 Project Structure

```
Travel-App/
├── backend/
│   ├── main.py              # FastAPI application & API routes
│   ├── requirements.txt     # Python backend dependencies
│   ├── roamlocal.db         # SQLite database
│   ├── SQLite/              # SQLAlchemy database models
│   ├── Submissions/         # Schemas and authentication utilities
│   └── server/              # Database session & engine setup
├── frontend/
│   ├── src/                 # React source code (pages, components, types)
│   ├── package.json         # Node.js dependencies
│   ├── .env.example         # Environment template
│   └── vite.config.ts       # Vite configuration
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
The backend API will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Google Client ID and Cloudinary credentials

# Start the Vite development server
npm run dev
```
The frontend will be running at `http://localhost:5173`.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
