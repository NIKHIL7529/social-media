# SocialSphere Backend

The core API and real-time engine for the SocialSphere platform. Built with Node.js and Express, it features a modular socket architecture and secure authentication.

## 🛠 Features

### 🔌 Modular Socket Handler
- **Event-Driven**: Decoupled socket logic via `socketManager.js` and dedicated `chatHandler.js`.
- **Middleware Integration**: Custom socket middleware for seamless JWT authentication during handshake.
- **Presence Management**: Intelligent tracking and broadcasting of user connection states.

### 🔐 Authentication & Security
- **JWT Protection**: Secure token-based authentication.
- **Secure Cookie Management**: Cookie-based token persistence for improved security against XSS.

### 🗄 Database Design
- **Mongoose Models**: Well-defined schemas for Users, Posts, Messages (Threads), and Groups.
- **Relational Integrity**: Efficient mapping between users/followers and group/chat threads.

## 📁 Key Directories

- `sockets/`: Modular socket.io logic (Authenticators and Event Handlers).
- `controller/`: REST API logic for users, posts, and messaging.
- `model/`: Mongoose schemas and data persistence logic.
- `routes/`: Express route definitions.

## 🚦 Getting Started

### Prerequisites
- Node.js
- MongoDB instance (Atlas or Local)

### Configuration
Create a `config.env` file in the root directory:
```env
PORT=8000
DATABASE=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### Run
```bash
npm install
npm run dev
```

## 📡 API Overview (Partial)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/user/login` | POST | Authenticates user and sets session cookie |
| `/api/message/allChats` | GET | Retrieves all 1v1 and group chat threads |
| `/api/post/allPost` | GET | Fetches global social feed |
| `/api/group/createGroup`| POST | Initializes a new group chat context |
