# 🎨 Zenith Flow | Real-Time Collaborative Whiteboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-cyan)
![Node](https://img.shields.io/badge/Node-v18+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.0-black)

**Zenith Flow** is a professional-grade, multi-user digital canvas built for high-performance collaboration. Designed with a sleek SaaS aesthetic, it enables developers and architects to brainstorm system designs with zero-latency synchronization.

---

## 🚀 Live Demo
🔗 **[View Live Project](https://zen-studio-flax.vercel.app/)**

---

## 💎 Features

### 🖥️ Workspace Management
* **Bento-style Dashboard:** Organize multiple projects in a clean, grid-based interface.
* **Collapsible Sidebar:** Maximize drawing space with a smooth, reactive navigation menu.
* **Database Persistence:** All canvases are saved to MongoDB and can be reloaded at any time.

### ✍️ Collaborative Canvas
* **Real-Time Sync:** See updates from other users instantly via WebSockets.
* **Smart Tools:** * **Precision Pencil:** Smooth line rendering with Konva.js.
  * **Snap-to-Grid:** Align elements perfectly using a 40px architectural grid.
  * **Laser Tool:** Temporary marks for highlighting specific areas during meetings.
* **Presence Tracking:** Live "User Count" indicator for active collaborators.

---

## 📸 Screenshots

### **1. Project Dashboard**
![Dashboard](./public/dashboard.png)
<img width="558" height="348" alt="Screenshot 2026-03-27 144345" src="https://github.com/user-attachments/assets/2c02958f-cdcc-468c-8621-fdfc383e53a4" />

*Professional workspace management with Glassmorphism UI.*

### **2. Collaborative Canvas**
![Canvas](./public/canvas.png)
*High-performance drawing interface with grid-snapping enabled.*

---

## 🛠️ Technical Architecture

### Frontend
- **React & TypeScript:** Type-safe components and state management.
- **Tailwind CSS:** Modern styling with dark-mode optimization.
- **Konva.js:** HTML5 2D canvas library for optimized drawing.

### Backend
- **Node.js & Express:** Scalable server architecture.
- **Socket.io:** Bidirectional, event-based communication.
- **MongoDB & Mongoose:** NoSQL document storage for canvas state and project metadata.

---

## ⚙️ Local Setup

1. **Clone & Install:**
   ```bash
   git clone [https://github.com/Nandani567/zenStudio](https://github.com/Nandani567/zenStudio)
   npm install
