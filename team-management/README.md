# 🏢 NexusTeam — Full-Stack Team Management System

A production-ready, secure team management platform with real-time chat, RBAC, and department-level isolation.

---

## 🗂️ Project Structure

```
team-management/
├── backend/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── seed.js             # Database seeder
│   ├── controllers/
│   │   ├── authController.js   # Login, getMe
│   │   ├── companyController.js
│   │   ├── departmentController.js
│   │   ├── groupController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js             # JWT verify, RBAC, dept access
│   ├── models/
│   │   ├── Company.js
│   │   ├── Department.js
│   │   ├── Group.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── company.js
│   │   ├── department.js
│   │   ├── group.js
│   │   ├── message.js
│   │   └── user.js
│   ├── socket/
│   │   └── socketManager.js    # Real-time chat w/ auth & room isolation
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx       # Sidebar + navigation
    │   │   └── LoadingScreen.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state + socket init
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── DepartmentPage.jsx
    │   │   ├── ChatPage.jsx
    │   │   └── AdminPage.jsx
    │   ├── services/
    │   │   ├── api.js           # Axios instance + all API calls
    │   │   └── socket.js        # Socket.io client helpers
    │   ├── App.jsx              # Routes + guards
    │   ├── index.css            # Global design system
    │   └── index.js
    └── package.json
```

---

## 🔐 Authorization Logic

### Layered Security Model

```
Request → JWT Auth → Company Check → Role Check → Department Check → Controller
```

1. **JWT Authentication** (`authenticate` middleware)
   - Extracts Bearer token from Authorization header
   - Verifies signature with `JWT_SECRET`
   - Fetches user from DB and attaches to `req.user`
   - Blocks expired, invalid, or inactive users

2. **Company Isolation** (`requireSameCompany`)
   - Validates that `req.params.companyId` matches `req.user.companyId`
   - Prevents cross-company URL hacking (e.g. `/api/company/otherCompanyId`)

3. **Role-Based Access** (`requireAdmin`)
   - Checks `req.user.role === 'ADMIN'`
   - Applied to all write operations and admin-only routes

4. **Department Isolation** (`requireDepartmentAccess`)
   - For EMPLOYEE: validates `req.params.departmentId === req.user.departmentId`
   - Admins bypass this check
   - Applied on department-specific routes

5. **Socket.io Auth**
   - Token verified via `io.use()` middleware before connection
   - Room join validates group → department → user.departmentId match
   - Message send re-validates access at send time (defense in depth)
   - Employees cannot join rooms outside their department

### Access Control Matrix

| Resource          | Admin | Own Dept Employee | Other Dept Employee |
|-------------------|-------|-------------------|---------------------|
| All departments   | ✅    | ❌ (own only)     | ❌                  |
| All users         | ✅    | ❌ (own dept)     | ❌                  |
| All groups        | ✅    | ❌ (own only)     | ❌                  |
| All messages      | ✅    | ❌ (own group)    | ❌                  |
| Create employee   | ✅    | ❌                | ❌                  |
| Assign department | ✅    | ❌                | ❌                  |
| Chat in group     | ✅    | ✅                | ❌                  |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed     # Seed demo data
npm run dev      # Start development server
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start        # Start React dev server
```

### 3. Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:3000
```

---

## 🔌 API Reference

### Auth
```
POST   /api/auth/login         → { token, user }
GET    /api/auth/me            → Current user (requires JWT)
```

### Company
```
POST   /api/company            → Create company (Admin)
GET    /api/company/:id        → Get company + stats
PUT    /api/company/:id        → Update company (Admin)
```

### Departments
```
POST   /api/departments        → Create department + auto-group (Admin)
GET    /api/departments        → List (Admin: all | Employee: own)
GET    /api/departments/:id    → Get dept + members (dept-access required)
PUT    /api/departments/:id    → Update (Admin)
```

### Users
```
POST   /api/users              → Create employee (Admin)
GET    /api/users              → List (Admin: all | Employee: own dept)
GET    /api/users/:id          → Get user (access controlled)
PUT    /api/users/:id/department → Assign/reassign dept (Admin)
PUT    /api/users/:id/status   → Toggle active status (Admin)
```

### Groups
```
POST   /api/groups             → Create group (Admin)
GET    /api/groups             → List (Admin: all | Employee: own)
GET    /api/groups/:id         → Get group (access controlled)
```

### Messages
```
GET    /api/messages/group/:groupId  → Paginated messages (access controlled)
POST   /api/messages                 → Send message (REST fallback)
DELETE /api/messages/:id             → Soft delete (own or Admin)
```

---

## ⚡ Socket.io Events

### Client → Server
```js
socket.emit('join_room', { groupId })   // Join department chat room
socket.emit('send_message', { content }) // Send message to current room
socket.emit('typing_start')              // Broadcast typing indicator
socket.emit('typing_stop')               // Stop typing indicator
```

### Server → Client
```js
socket.on('joined_room', { groupId, groupName })     // Confirmed room join
socket.on('new_message', { message })                 // New message broadcast
socket.on('user_typing', { userId, name })            // Someone is typing
socket.on('user_stopped_typing', { userId })          // Stopped typing
socket.on('error', { message })                       // Access denied / errors
```

---

## 🎯 Demo Credentials (after seeding)

| Role     | Email                   | Password |
|----------|-------------------------|----------|
| Admin    | admin@nexuscorp.com     | admin123 |
| Frontend | alice@nexuscorp.com     | emp123   |
| Backend  | carol@nexuscorp.com     | emp123   |
| Sales    | eva@nexuscorp.com       | emp123   |
| HR       | grace@nexuscorp.com     | emp123   |

---

## 🛡️ Security Features

- **Password hashing**: bcrypt with cost factor 12
- **JWT**: 7-day expiry, verified on every request
- **Company isolation**: All resources scoped to companyId
- **Department isolation**: Employees can only see/access their dept
- **URL hacking prevention**: Server validates IDs against user's assigned context
- **Socket auth**: Token verified before WebSocket connection established
- **Defense in depth**: Access checked at join-room AND send-message time
- **Soft deletes**: Messages marked deleted, not removed from DB
- **Input validation**: Mongoose validators + route-level checks

---

## 🏗️ Architecture Decisions

- **One group per department**: Enforced by unique compound index `{ departmentId, companyId }`
- **Auto-group creation**: Creating a department automatically creates its chat group
- **Socket fallback**: Chat sends via Socket.io with REST API as fallback
- **Modular controllers**: Each resource has its own controller, route, and model file
- **Scalable**: Auth middleware is composable; new roles can be added by extending `requireAdmin`
