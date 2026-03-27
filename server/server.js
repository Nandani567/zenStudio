require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

// --- FIXED CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:5173", 
  "https://zen-studio-flax.vercel.app/"
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy: Origin not allowed'), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST"],
  credentials: true 
}));


app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("ZENITH_DATABASE_SECURE"))
  .catch(err => console.error("DB_CONNECTION_ERROR", err));

// --- SCHEMAS (Kept exactly as yours) ---
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

const Project = mongoose.model('Project', new mongoose.Schema({
  name: { type: String, required: true },
  roomId: { type: String, unique: true },
  owner: String,
  createdAt: { type: Date, default: Date.now }
}));

const Activity = mongoose.model('Activity', new mongoose.Schema({
  user: String,
  action: String,
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  createdAt: { type: Date, default: Date.now }
}));

const Line = mongoose.model('Line', new mongoose.Schema({
  roomId: String,
  tool: String,
  color: String,
  points: [Number],
  width: Number,
  shadowColor: String,
  shadowBlur: Number,
  createdAt: { type: Date, default: Date.now }
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  roomId: { type: String, required: true },
  user: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

// --- AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ username: req.body.username, password: hashedPassword });
    res.json({ success: true, username: user.username });
  } catch (err) { res.status(400).json({ error: "Identity Taken" }); }
});

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    res.json({ success: true, username: user.username });
  } else { res.status(401).json({ error: "Access Denied" }); }
});

// --- SOCKET ENGINE ---
const server = http.createServer(app);

// --- FIXED SOCKET CORS ---
const io = new Server(server, { 
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  } 
});

io.on('connection', (socket) => {
  // Dashboard Sync
  socket.on('get-projects', async () => {
    socket.emit('projects-list', await Project.find().sort({ createdAt: -1 }));
  });

  socket.on('get-activity', async () => {
    socket.emit('activity-update', await Activity.find().sort({ createdAt: -1 }).limit(15));
  });

  // Project Management
  socket.on('create-project', async (data) => {
    const newId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const newProject = await Project.create({ ...data, roomId: newId });
    await Activity.create({ user: data.owner, action: `initialized archive "${data.name}"` });
    
    const allProjects = await Project.find().sort({ createdAt: -1 });
    io.emit('projects-list', allProjects);
    socket.emit('project-created', newProject);
  });

  // Room Logic (Canvas + Chat)
  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    const drawingHistory = await Line.find({ roomId }).sort({ createdAt: 1 });
    socket.emit('load-history', drawingHistory);
    const chatHistory = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(50);
    socket.emit('receive-chat-history', chatHistory); 
    const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit('user-count', count);
  });

  // Real-time Drawing
  socket.on('save-line', async ({ roomId, lineData }) => {
    await Line.create({ ...lineData, roomId });
    socket.to(roomId).emit('draw-line', lineData);
  });

  // Real-time Chat
  socket.on('send-chat', async ({ roomId, msg }) => {
    const savedMsg = await Message.create({ roomId, ...msg });
    io.to(roomId).emit('receive-chat', savedMsg);
  });

  // Reset Logic
  socket.on('clear-canvas', async (roomId) => {
    await Line.deleteMany({ roomId });
    io.to(roomId).emit('clear-canvas');
  });

  // Cleanup
  socket.on('disconnecting', () => {
    socket.rooms.forEach(r => {
      const size = (io.sockets.adapter.rooms.get(r)?.size || 1) - 1;
      io.to(r).emit('user-count', Math.max(0, size));
    });
  });
});

// Use process.env.PORT for Render deployment
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`ZENITH_CORE_ONLINE // PORT: ${PORT}`));