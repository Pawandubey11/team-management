# team-management
<p align="center">
  <img src="https://img.shields.io/badge/Project-Team%20Management-blue?style=for-the-badge" alt="Project" />
  <img src="https://img.shields.io/badge/Status-Active-green?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Type-Full--Stack-orange?style=for-the-badge" alt="Type" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <h1>👥 Team Management System</h1>
  <p><i>A role-based team management platform where administrators assign users to departments, and users can access their assigned department's chat and tasks.</i></p>
</p>

---

## 📋 About the Project

The Team Management System is a full-stack web application designed to streamline organizational communication and task management. Built with a clean separation between frontend and backend, this project implements role-based access control (RBAC) to ensure that users can only interact with content relevant to their assigned department.

This project demonstrates proficiency in building secure, scalable web applications with proper authentication, authorization, and real-time communication features.

---

## ✨ Features

### Role-Based Access Control (RBAC)
- ✅ Admin can create and manage departments
- ✅ Admin can assign users to specific departments
- ✅ Users can only access their assigned department's data
- ✅ Secure role-based authentication flow

### Department Management
- ✅ Create, update, and delete departments
- ✅ View department members and their roles
- ✅ Department-wise task and chat segregation

### Task Management
- ✅ Create and assign tasks within departments
- ✅ Track task status (Pending, In Progress, Completed)
- ✅ Task prioritization and deadlines

### Chat System
- ✅ Department-specific chat channels
- ✅ Real-time messaging within departments
- ✅ Message history and notifications

### User Management
- ✅ User registration and login
- ✅ Profile management
- ✅ Password security with hashing

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|------------|-------|
| **HTML5** | Page structure |
| **CSS3** | Styling and layout |
| **JavaScript** | Interactive UI |

### Backend
| Technology | Usage |
|------------|-------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **JWT** | Token-based authentication |
| **bcrypt** | Password hashing |
| **Socket.io** | Real-time chat |

### Development Tools
| Technology | Usage |
|------------|-------|
| **Git & GitHub** | Version control |
| **Postman** | API testing |
| **VS Code** | Code editor |

---

## 🗂️ Project Structure

```
team-management/
│
├── backend/                # Backend API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth middleware
│   └── config/             # Database config
│
├── frontend/               # Frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source files
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── styles/         # CSS styles
│   └── package.json        # Frontend dependencies
│
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- **Git**

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file and add:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Start the server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`

---

## 🐳 Full-Stack Deployment with Docker

This repo includes a Docker Compose setup for the React frontend, Express backend, and MongoDB database.

### Local full-stack run

```bash
# From the project root
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`
- MongoDB: `localhost:27017`

The frontend container serves the React build through nginx and proxies `/api` and `/socket.io` to the backend container, so the API and real-time chat work from one browser origin.

### Seed demo data

After the containers are running:

```bash
docker compose exec backend npm run seed
```

Demo credentials:

- Admin: `admin@nexuscorp.com` / `admin123`
- Employee: `alice@nexuscorp.com` / `emp123`

### Production environment variables

Set these before deploying:

```bash
JWT_SECRET=use-a-long-random-production-secret
CLIENT_URL=https://your-frontend-domain.example
```

If you use a managed database such as MongoDB Atlas, set:

```bash
MONGODB_URI=mongodb+srv://...
```

For separate frontend/backend hosts, set these in the frontend build environment:

```bash
REACT_APP_API_URL=https://your-backend-domain.example/api
REACT_APP_SOCKET_URL=https://your-backend-domain.example
```

If the frontend is served behind the included nginx proxy, leave those frontend variables unset so it uses `/api` and same-origin Socket.IO.

### Deploy on a new server

After creating a cloud instance and installing Docker with the Docker Compose plugin:

```bash
git clone https://github.com/Pawandubey11/team-management.git
cd team-management
cp .env.production.example .env
nano .env
sh scripts/deploy-docker.sh
```

In `.env`, set:

```bash
JWT_SECRET=your-long-random-secret
CLIENT_URL=http://your-server-ip:8080
```

Open these ports in the instance firewall/security group:

- `8080` for the frontend
- `5000` for direct backend API access, optional if you only use the frontend proxy
- `27017` only if you intentionally need external MongoDB access

Useful operations:

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

Seed the first demo users:

```bash
docker compose exec backend npm run seed
```

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation and sanitization

---

## 📸 Screenshots

| Admin Dashboard | User Dashboard |
|:---:|:---:|
| Coming Soon | Coming Soon |

---

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] File sharing within departments
- [ ] Task dependencies and Gantt charts
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Integration with cloud storage (AWS S3)

---

## 👨‍💻 Author

**Pawan Dubey**  
🎓 Student, IILM University | Cloud & DevOps Engineer  
📧 [pawandubey6204385@gmail.com](mailto:pawandubey6204385@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/pawandubey11/) | [GitHub](https://github.com/Pawandubey11)

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <i>⭐ Don't forget to leave a star if you find this project useful!</i>
</p>
