# Purple Merit — User Management System

A production-ready full-stack User Management System built with the MERN stack. Features role-based access control (RBAC), JWT authentication, and a modern admin dashboard.

## 🔗 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://purple-merit-user-management-system.vercel.app |
| **Backend API** | https://purple-merit-user-management-system.onrender.com |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Manager | manager@example.com | password123 |
| User | user@example.com | password123 |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Lucide React** (icons)

### Backend
- **Node.js + Express.js**
- **TypeScript**
- **MongoDB Atlas** (cloud database)
- **Mongoose** (ODM)
- **JWT** (authentication)
- **bcryptjs** (password hashing)
- **Zod** (validation)

---

## 📁 Project Structure

```
Purple-Merit---User-Management-System/
├── frontend/                  # Next.js frontend
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   ├── dashboard/     # Stats & activity
│   │   │   ├── users/         # User management
│   │   │   ├── roles/         # Roles & permissions
│   │   │   └── settings/      # Profile settings
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── auth/              # Auth components
│   │   ├── layout/            # Navbar, Sidebar
│   │   └── ui/                # Reusable UI components
│   ├── context/               # Auth context
│   ├── lib/                   # API client, types, constants
│   └── .env.local             # Frontend env vars
│
├── backend/                   # Express.js backend
│   ├── src/
│   │   ├── config/            # DB connection, env config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   └── utils/             # JWT, response helpers, seed
│   └── .env                   # Backend env vars
│
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/sarthak0105/Purple-Merit---User-Management-System.git
cd Purple-Merit---User-Management-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/purple-merit
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

Seed the database:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🗄️ Database Schema

### Collections

#### `permissions`
```json
{
  "_id": "ObjectId",
  "name": "string (unique)",
  "description": "string",
  "category": "users | roles | dashboard | settings",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### `roles`
```json
{
  "_id": "ObjectId",
  "name": "string (unique, lowercase)",
  "description": "string",
  "permissions": ["ObjectId → permissions"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, lowercase)",
  "password": "string (bcrypt hashed, never returned)",
  "role": "ObjectId → roles",
  "status": "active | inactive | suspended",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Default Seed Data

**12 Permissions** across 4 categories:
- `users`: view_users, create_user, edit_user, delete_user
- `roles`: view_roles, create_role, edit_role, delete_role
- `dashboard`: view_dashboard, view_stats
- `settings`: view_settings, edit_settings

**3 Roles:**
| Role | Permissions |
|------|-------------|
| admin | All 12 permissions |
| manager | view_users, edit_user, view_roles, view_dashboard, view_stats |
| user | view_dashboard |

**3 Demo Users:**
| Name | Email | Role |
|------|-------|------|
| John Admin | admin@example.com | admin |
| Jane Manager | manager@example.com | manager |
| Bob User | user@example.com | user |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/auth/me` | Auth | Get current user |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin, Manager | List users (paginated) |
| POST | `/api/users` | Admin | Create user |
| GET | `/api/users/:id` | Admin, Manager | Get user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Roles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/roles` | All auth | List roles |
| POST | `/api/roles` | Admin | Create role |
| GET | `/api/roles/:id` | All auth | Get role |
| PUT | `/api/roles/:id` | Admin | Update role |
| DELETE | `/api/roles/:id` | Admin | Delete role |

### Permissions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/permissions` | All auth | List all permissions |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/stats` | Admin, Manager | System stats |

---

## 🔐 Role-Based Access Control

| Feature | Admin | Manager | User |
|---------|-------|---------|------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Users | ✅ | ✅ | ❌ |
| Create Users | ✅ | ❌ | ❌ |
| Edit Users | ✅ | ✅ | ❌ |
| Delete Users | ✅ | ❌ | ❌ |
| View Roles | ✅ | ✅ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ |
| Edit Settings | ✅ | ✅ | ✅ |

---

## 🐳 Docker Setup (Optional)

```bash
docker-compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MongoDB: `mongodb://localhost:27017`

---

## 🌐 Deployment

### Backend → Render
1. Connect GitHub repo
2. Root Directory: `backend`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add environment variables (see `.env.example`)

### Frontend → Vercel
1. Connect GitHub repo
2. Root Directory: `frontend`
3. Add `NEXT_PUBLIC_API_URL` environment variable

---

## 📝 Environment Variables

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/purple-merit
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
