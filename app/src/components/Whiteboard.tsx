


import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line as KonvaLine } from 'react-konva';
import { 
  Pencil, Eraser, Trash2, LayoutGrid, ArrowLeft, Zap, Download, 
  Layers, Settings2, Activity as ActivityIcon, LogOut, ChevronRight, 
  Sun, Moon, Presentation, Highlighter, Sparkles, Copy, Check, Link as LinkIcon,
  MessageSquare, Send, X, Users, Heart, Palette
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

const Whiteboard = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('zenith_user'));
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [view, setView] = useState<'dashboard' | 'canvas'>('dashboard');
  const [activeTab, setActiveTab] = useState<'projects' | 'activity' | 'settings'>('projects');
  const [theme, setTheme] = useState<'dark' | 'light'>( (localStorage.getItem('zenith_theme') as 'dark' | 'light') || 'dark');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'marker' | 'glow'>('pen');
  const [color, setColor] = useState('#6366f1'); 
  const [lines, setLines] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [copied, setCopied] = useState(false);

  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    socket.emit('get-projects');
    socket.emit('get-activity');
    socket.on('projects-list', setProjects);
    socket.on('activity-update', setActivities);
    socket.on('project-created', (p) => { setCurrentProject(p); setView('canvas'); socket.emit('join-room', p.roomId); });
    socket.on('load-history', setLines);
    socket.on('draw-line', (line) => setLines(prev => [...prev, line]));
    socket.on('clear-canvas', () => setLines([]));
    socket.on('user-count', setUserCount);
    socket.on('receive-chat', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('receive-chat-history', setMessages);
    return () => { socket.off(); };
  }, [user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const res = await axios.post(`http://localhost:3001${endpoint}`, authData);
      setUser(res.data.username);
      localStorage.setItem('zenith_user', res.data.username);
    } catch (err) { alert("Access Denied"); }
  };

  const sendChat = () => {
    if (!chatMsg.trim() || !currentProject) return;
    const msg = { user, text: chatMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    socket.emit('send-chat', { roomId: currentProject.roomId, msg });
    setChatMsg('');
  };

  const isDark = theme === 'dark';
  
  // PLAYFUL UI CONFIG
  const UI = {
    bg: isDark ? "bg-[#0A0C10]" : "bg-[#F8FAFF]",
    card: isDark ? "bg-[#161B22] border-[#21262D]" : "bg-white border-[#E1E4E8] shadow-sm",
    sidebar: isDark ? "bg-[#0D1117] border-[#21262D]" : "bg-white border-[#E1E4E8]",
    text: isDark ? "text-[#C9D1D9]" : "text-[#1F2328]",
    accent: "bg-gradient-to-br from-fuchsia-500 to-indigo-600",
    btn: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-105 transition-transform"
  };

  if (!user) {
    return (
      <div className={`h-screen w-full flex items-center justify-center ${UI.bg} ${UI.text}`}>
        <div className={`w-full max-w-sm p-10 rounded-[2.5rem] shadow-2xl ${UI.card} relative overflow-hidden`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-3xl bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30">
                <Zap size={32} fill="white" stroke="white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center tracking-tight mb-2">Zenith Flow</h1>
          <p className="text-center text-xs opacity-50 mb-8 font-medium italic">Ready to create magic?</p>
          <div className="space-y-4">
            <input type="text" placeholder="Your Name" className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDark ? 'bg-[#0d1117] border-neutral-800 focus:border-indigo-500' : 'bg-[#f6f8fa] border-neutral-200 focus:border-indigo-500'}`} onChange={e => setAuthData({...authData, username: e.target.value})} />
            <input type="password" placeholder="Passkey" className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDark ? 'bg-[#0d1117] border-neutral-800 focus:border-indigo-500' : 'bg-[#f6f8fa] border-neutral-200 focus:border-indigo-500'}`} onChange={e => setAuthData({...authData, password: e.target.value})} />
            <button onClick={handleAuth} className={`w-full py-4 font-bold rounded-2xl shadow-lg ${UI.btn}`}>Let's Go!</button>
            <p onClick={() => setIsLogin(!isLogin)} className="text-center text-xs font-bold cursor-pointer text-indigo-500 mt-4 hover:underline">{isLogin ? "Join the squad" : "Back to login"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full flex overflow-hidden font-sans ${UI.bg} ${UI.text}`}>
      {/* PLAYFUL SIDEBAR */}
      <aside className={`w-24 flex flex-col items-center py-8 border-r-2 ${UI.sidebar} z-[200]`}>
        <button onClick={() => setView('dashboard')} className="p-4 rounded-3xl bg-indigo-500 mb-12 hover:scale-110 transition-transform shadow-xl shadow-indigo-500/20">
            <Zap size={24} fill="white" stroke="white" />
        </button>
        <div className="flex flex-col gap-6">
          <button onClick={() => {setView('dashboard'); setActiveTab('projects');}} className={`p-4 rounded-2xl transition-all ${activeTab === 'projects' && view === 'dashboard' ? 'bg-indigo-500/10 text-indigo-500' : 'text-neutral-400 hover:text-indigo-400'}`}><LayoutGrid size={24}/></button>
          <button onClick={() => {setView('dashboard'); setActiveTab('activity');}} className={`p-4 rounded-2xl transition-all ${activeTab === 'activity' && view === 'dashboard' ? 'bg-pink-500/10 text-pink-500' : 'text-neutral-400 hover:text-pink-400'}`}><ActivityIcon size={24}/></button>
          <button onClick={() => {setView('dashboard'); setActiveTab('settings');}} className={`p-4 rounded-2xl transition-all ${activeTab === 'settings' && view === 'dashboard' ? 'bg-amber-500/10 text-amber-500' : 'text-neutral-400 hover:text-amber-400'}`}><Settings2 size={24}/></button>
        </div>
        <div className="mt-auto flex flex-col gap-6">
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-500/10 hover:bg-neutral-500/20 transition-all">{isDark ? <Sun size={20} className="text-amber-400"/> : <Moon size={20} className="text-indigo-600"/>}</button>
          <button onClick={() => { setUser(null); localStorage.clear(); }} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><LogOut size={20}/></button>
        </div>
      </aside>

      <div className="flex-1 relative">
        {view === 'dashboard' ? (
          <main className="h-full p-12 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        Hey {user}! <span className="animate-bounce">👋</span>
                    </h2>
                    <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-1">Ready for some creative flow?</p>
                </div>
                {activeTab === 'projects' && (
                    <button onClick={() => {const n = prompt("Name your masterpiece:"); if(n) socket.emit('create-project', { name: n, owner: user });}} className={`px-8 py-4 rounded-2xl font-bold text-sm shadow-xl ${UI.btn}`}>+ Create New</button>
                )}
            </header>

            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {projects.length > 0 ? projects.map((p, i) => (
                        <div key={p.roomId} onClick={() => { setCurrentProject(p); setView('canvas'); socket.emit('join-room', p.roomId); }} className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between h-64 group relative overflow-hidden ${UI.card} hover:-translate-y-2 hover:shadow-2xl`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 bg-gradient-to-br ${i % 2 === 0 ? 'from-indigo-500 to-purple-500' : 'from-pink-500 to-orange-500'}`}></div>
                            <div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${i % 2 === 0 ? 'bg-indigo-500 text-white' : 'bg-pink-500 text-white'}`}>
                                    <Palette size={20}/>
                                </div>
                                <h3 className="text-2xl font-black leading-tight">{p.name}</h3>
                                <p className="text-[10px] font-bold text-neutral-400 mt-2 tracking-widest uppercase">ID: {p.roomId}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-500/10">
                                    <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-pink-500'}`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-tight opacity-60">{p.owner === user ? 'Owner' : 'Guest'}</span>
                                </div>
                                <div className="p-2 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500 transition-all group-hover:text-white">
                                    <ChevronRight size={20}/>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center border-4 border-dashed rounded-[3rem] border-neutral-500/10">
                             <div className="w-20 h-20 rounded-full bg-neutral-500/5 flex items-center justify-center mb-6">
                                <Heart size={40} className="text-neutral-500/20" />
                             </div>
                             <p className="font-bold text-neutral-400 italic">No projects here yet. Start something amazing!</p>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'activity' && (
                <div className="max-w-3xl grid grid-cols-1 gap-4">
                    {activities.map((act, i) => (
                        <div key={i} className={`p-6 rounded-3xl border-2 flex items-center justify-between ${UI.card}`}>
                            <div className="flex items-center gap-5">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white ${UI.accent}`}>{act.user[0].toUpperCase()}</div>
                                <div>
                                    <p className="text-sm font-black uppercase"><span className="text-indigo-500">{act.user}</span></p>
                                    <p className="text-xs font-bold text-neutral-400 tracking-tight">{act.action}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold bg-neutral-500/5 px-3 py-1 rounded-full">{act.time}</span>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-6">
                    <div className={`p-10 rounded-[3rem] border-2 shadow-xl flex items-center gap-8 ${UI.card}`}>
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl ${UI.accent}`}>{user[0].toUpperCase()}</div>
                        <div>
                            <h4 className="text-3xl font-black tracking-tight">{user}</h4>
                            <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Master Designer</p>
                        </div>
                    </div>
                </div>
            )}
          </main>
        ) : (
          /* --- CANVAS VIEW: PLAYFUL --- */
          <div className={`h-full w-full relative ${isDark ? 'bg-[#0F1115]' : 'bg-[#FFFFFF]'} animate-in fade-in duration-1000`}>
            {/* FLOATING NAVBAR */}
            <nav className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 rounded-[2rem] border-2 flex items-center gap-4 shadow-2xl backdrop-blur-2xl ${isDark ? 'bg-black/60 border-neutral-800' : 'bg-white/80 border-neutral-100'}`}>
              <button onClick={() => setView('dashboard')} className="p-3 rounded-2xl text-neutral-400 hover:bg-neutral-500/10 hover:text-indigo-500 transition-all"><ArrowLeft size={20}/></button>
              <div className="w-[2px] h-8 bg-neutral-500/10 mx-2" />
              <div className="flex gap-2">
                <button onClick={() => setTool('pen')} className={`p-3 rounded-2xl transition-all ${tool === 'pen' ? 'bg-indigo-500 text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-500/10'}`}><Pencil size={20}/></button>
                <button onClick={() => setTool('marker')} className={`p-3 rounded-2xl transition-all ${tool === 'marker' ? 'bg-purple-500 text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-500/10'}`}><Highlighter size={20}/></button>
                <button onClick={() => setTool('glow')} className={`p-3 rounded-2xl transition-all ${tool === 'glow' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'text-neutral-400 hover:bg-neutral-500/10'}`}><Sparkles size={20}/></button>
                <button onClick={() => setTool('eraser')} className={`p-3 rounded-2xl transition-all ${tool === 'eraser' ? 'bg-amber-500 text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-500/10'}`}><Eraser size={20}/></button>
              </div>
              <div className="flex gap-2 mx-2">
                {['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ffffff', '#000000'].map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125 ${color === c ? 'scale-125 ring-4 ring-indigo-500/20' : 'opacity-80'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="w-[2px] h-8 bg-neutral-500/10 mx-2" />
              <div className="flex gap-3">
                  <button onClick={() => setIsPresenting(!isPresenting)} className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase transition-all shadow-md ${isPresenting ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Live</button>
                  <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-3 rounded-2xl relative transition-all ${isChatOpen ? 'bg-indigo-500 text-white' : 'text-neutral-400 hover:bg-neutral-500/10'}`}>
                    <MessageSquare size={20}/>
                  </button>
                  <button onClick={() => socket.emit('clear-canvas', currentProject.roomId)} className="p-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-500"><Trash2 size={20}/></button>
              </div>
            </nav>

            {/* CHAT DRAWER: GLASSMORPHISM */}
            <div className={`fixed top-4 right-4 h-[calc(100%-2rem)] w-96 z-[150] transition-all duration-700 ease-in-out rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-3xl overflow-hidden ${isDark ? 'bg-black/60 border-neutral-800' : 'bg-white/90 border-neutral-100'} ${isChatOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'}`}>
                <div className="p-8 border-b-2 border-neutral-500/5 flex justify-between items-center bg-indigo-500/5">
                    <h4 className="font-black text-sm uppercase tracking-widest flex items-center gap-3"><Users size={18} className="text-indigo-500"/> Chat Space</h4>
                    <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-xl hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all"><X size={20}/></button>
                </div>
                <div className="h-[calc(100%-180px)] overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.user === user ? 'items-end' : 'items-start'}`}>
                            <p className="text-[10px] font-black text-indigo-500 mb-1 px-2">{m.user}</p>
                            <div className={`p-4 rounded-3xl text-sm shadow-sm ${m.user === user ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-neutral-500/10 text-neutral-600 rounded-tl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-6 absolute bottom-0 w-full flex gap-3">
                    <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} placeholder="Say something..." className={`flex-1 p-4 rounded-2xl text-sm outline-none border-2 transition-all ${isDark ? 'bg-black/40 border-neutral-800 focus:border-indigo-500' : 'bg-white border-neutral-100 focus:border-indigo-500'}`} />
                    <button onClick={sendChat} className={`p-4 rounded-2xl shadow-lg transition-transform hover:scale-110 ${UI.btn}`}><Send size={20}/></button>
                </div>
            </div>

            {/* STATUS HUD */}
            <div className={`fixed bottom-8 left-8 p-4 rounded-2xl border-2 shadow-lg flex items-center gap-4 animate-in fade-in duration-1000 ${isDark ? 'bg-black/40 border-neutral-800' : 'bg-white/80 border-neutral-100'}`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black">{userCount}</div>
                <div>
                    <p className="text-[10px] font-black uppercase opacity-40">Connected</p>
                    <p className="text-xs font-bold">{currentProject?.name}</p>
                </div>
            </div>

            <Stage 
              ref={stageRef} width={window.innerWidth} height={window.innerHeight} 
              onMouseDown={(e: any) => {
                isDrawing.current = true;
                const pos = e.target.getStage().getPointerPosition();
                let w = 4; let c = color;
                if (tool === 'marker') w = 15;
                if (tool === 'glow') w = 8;
                if (tool === 'eraser') { w = 60; c = isDark ? '#0F1115' : '#FFFFFF'; }
                setLines([...lines, { tool, color: c, points: [pos.x, pos.y], width: w, shadowColor: tool === 'glow' ? color : 'transparent', shadowBlur: tool === 'glow' ? 25 : 0 }]);
              }} 
              onMousemove={(e: any) => {
                if (!isDrawing.current) return;
                const pos = e.target.getStage().getPointerPosition();
                let lastLine = { ...lines[lines.length - 1] };
                lastLine.points = lastLine.points.concat([pos.x, pos.y]);
                const updated = [...lines];
                updated[lines.length - 1] = lastLine;
                setLines(updated);
                if (!isPresenting) socket.emit('save-line', { roomId: currentProject.roomId, lineData: lastLine, userName: user });
                else socket.emit('draw-line', { roomId: currentProject.roomId, lineData: lastLine });
              }} 
              onMouseup={() => { isDrawing.current = false; }}
              className="cursor-crosshair"
            >
              <Layer>
                {lines.map((l, i) => (
                  <KonvaLine key={i} points={l.points} stroke={l.color} strokeWidth={l.width} tension={0.5} lineCap="round" lineJoin="round" shadowColor={l.shadowColor} shadowBlur={l.shadowBlur} />
                ))}
              </Layer>
            </Stage>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;