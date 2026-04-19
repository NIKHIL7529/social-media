# SocialSphere Frontend

The dynamic interface for the SocialSphere platform. A modern React application optimized for real-time interactions and a premium user experience.

## ✨ Technical Highlights

### 🚄 Modular Feature Architecture
Organized using a feature-based structure (found in `src/features/`), ensuring high maintainability and scalability for core components like Chat and Discovery.

### 🔌 Stable Real-Time Core
- **Optimized Sockets**: Managed via the `useChatSocket` custom hook, providing a clean lifecycle for real-time connections.
- **State Synchronization**: Integrated with **React Context** (`ChatContext`) for unified real-time data flow across Sidebar and Message components.
- **Presence UI**: Instant visual feedback for online status and typing indicators.

### 🎨 Premium UI/UX
- **Material UI (MUI)**: Leveraged for a clean, professional, and responsive component library.
- **Animated Interactions**: Seamless transitions and auto-scrolling message windows for a polished feel.

## 📁 Key Features
- **Global Social Feed**: Personalized home page for content discovery.
- **Robust Messaging**: Complete private and group chat suite with real-time delivery.
- **Search & Discovery**: Find and bridge with other users instantly.
- **Profile Customization**: Detailed user profiles and dynamic image management.

## 🛠 Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS + Material UI (MUI)
- **Real-time**: Socket.io-client
- **Date Management**: date-fns

## 🚦 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   ```
