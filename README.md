# SocialSphere: Real-Time Full-Stack Social Platform

A robust, feature-rich social media platform designed for real-time engagement and high-performance user interaction. Built with the **MERN** stack (MongoDB, Express, React, Node.js) and powered by **Socket.io** for seamless, low-latency communication.

## 🚀 Key Features

### 💬 Real-Time Communication
- **Engineered Messaging**: Individual and group chat support utilizing a modular socket handler architecture.
- **Presence Tracking**: Real-time "Online/Offline" status synchronization across the platform.
- **Engagement Indicators**: Cross-client typing indicators for enhanced conversational flow.

### 📱 Social Core
- **Interactive Feed**: Dynamic content discovery with post likes, saves, and real-time updates.
- **Relationship Management**: Robust follower/following ecosystem with instant notification mapping.
- **Discovery**: Optimized user search functionality.

### 🛠 Technical Architecture
- **State management**: Component-driven frontend utilizing React Context and custom hooks for persistent real-time states.
- **Security**: JWT-based authentication with secure httpOnly cookie management.
- **Media Optimization**: Integrated Cloudinary support for optimized image persistence and delivery.
- **Scalability**: Decoupled frontend/backend architecture with modular event-driven socket logic.

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Material UI (MUI), Socket.io-client |
| **Backend** | Node.js, Express, Socket.io, JWT |
| **Database** | MongoDB, Mongoose |
| **Cloud** | Cloudinary (Media), Render/Vercel (Deployment) |

## 🏗 Project Structure

```bash
├── social-media-backend/    # Node.js/Express server & Socket.io handlers
└── social-media-frontend/   # React/Vite client application
```

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nikhil7529/social-media.git
   cd social-media
   ```

2. **Backend Configuration**
   - Navigate to `social-media-backend/`
   - Install dependencies: `npm install`
   - Create a `config.env` based on the environment section in the backend directory.
   - Run: `npm run dev`

3. **Frontend Configuration**
   - Navigate to `social-media-frontend/`
   - Install dependencies: `npm install`
   - Create a `.env` file with `VITE_BACKEND_URL`.
   - Run: `npm run dev`

---
*Developed by [Nikhil Gupta](https://github.com/Nikhil7529)*
