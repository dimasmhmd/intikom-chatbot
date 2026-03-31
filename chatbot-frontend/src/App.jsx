import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, Search, Menu, X, MessageSquare, Send, 
  User, Paperclip, Loader2, FileText, Trash2, ArrowRight,
  ShieldAlert, LogOut, Database, AlertCircle, CheckCircle2
} from 'lucide-react';

// Ganti dengan URL Backend Hugging Face atau Localhost Anda
const API_BASE_URL = "https://dimasmhmd-intikom-backend.hf.space/api";

// --- KOMPONEN CHATBOT WIDGET (KHUSUS USER) ---
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('rag_session_id');
    if (storedSession) {
      setSessionId(storedSession);
    } else {
      const newSession = 'sess_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('rag_session_id', newSession);
      setSessionId(newSession);
    }
    setMessages([
      { role: 'ai', text: 'Halo! Saya asisten virtual Intikom (Powered by Azure). Ada yang bisa saya bantu hari ini?' }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userMsg })
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Maaf, terjadi kesalahan pada server Azure." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Koneksi terputus. Pastikan server backend Anda menyala." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[340px] sm:w-96 h-[500px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right">
          
          <div className="bg-[#14429A] p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden shadow-sm">
                <img src="/image_69e9c5.png" alt="Bot" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/24?text=Bot' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide">Intikom Support</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1.5 opacity-90">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span> Azure RAG Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition duration-200">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f8fafc]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden shadow-sm ${msg.role === 'user' ? 'bg-gray-200 text-gray-500' : 'bg-white border border-gray-100'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <img src="/image_69e9c5.png" alt="Bot" className="w-full h-full object-contain p-1" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#14429A] text-white rounded-tr-sm' : 'bg-white text-gray-700 rounded-tl-sm border border-gray-100'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mt-1 overflow-hidden"><img src="/image_69e9c5.png" alt="Bot" className="w-full h-full object-contain p-1" /></div>
                  <div className="p-3.5 px-4 rounded-2xl bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya seputar Intikom..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100/80 border border-transparent rounded-full focus:outline-none focus:ring-1 focus:ring-[#14429A]/30 focus:bg-white text-[14px] transition-all"
                disabled={isTyping}
              />
              <button
                type="submit" disabled={!input.trim() || isTyping}
                className="absolute right-1.5 w-9 h-9 bg-[#E01E26] text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-sm"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
            <div className="text-center mt-2 text-[10px] text-gray-400">Ditenagai oleh Intikom AI Support</div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-all duration-300 z-50 hover:scale-105 active:scale-95 ${isOpen ? 'bg-[#E01E26] rotate-90' : 'bg-[#14429A] rotate-0'}`}
      >
        {isOpen ? <X className="text-white" size={28} /> : <MessageSquare className="text-white" size={26} />}
      </button>
    </div>
  );
}

// --- KOMPONEN DASHBOARD ADMIN ---
function AdminDashboard({ onLogout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef(null);

  const showNotif = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') setIsLoggedIn(true);
    else showNotif('Password salah!', 'error');
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/files`);
      const data = await res.json();
      if (res.ok) setFiles(data.files || []);
      else throw new Error(data.detail || "Gagal mengambil data");
    } catch (err) {
      showNotif("Gagal terhubung ke backend Azure. " + err.message, "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchFiles();
  }, [isLoggedIn]);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        showNotif(data.message, "success");
        fetchFiles(); // Refresh tabel
      } else {
        throw new Error(data.detail);
      }
    } catch (error) {
      showNotif("Gagal mengunggah: " + error.message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Yakin ingin menghapus dokumen "${filename}"?\n\nTindakan ini akan menghapus file dari Storage DAN memori obrolan AI selamanya.`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/files/${encodeURIComponent(filename)}`, {
        method: "DELETE"
      });
      const data = await response.json();
      
      if (response.ok) {
        showNotif(data.message, "success");
        fetchFiles(); // Refresh tabel setelah dihapus
      } else {
        throw new Error(data.detail);
      }
    } catch (error) {
      showNotif("Gagal menghapus: " + error.message, "error");
    }
  };

  // Tampilan Halaman Login Admin
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#14429A]"></div>
          <button onClick={onLogout} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={20}/></button>
          
          <div className="flex justify-center mb-6">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <img src="/image_5ffce0.png" alt="Intikom Logo" className="h-12 object-contain" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Akses</h2>
          <p className="text-center text-sm text-gray-500 mb-8">Masuk untuk mengelola basis pengetahuan AI.</p>
          
          {notification.show && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {notification.message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password System</label>
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14429A] transition-all"
                placeholder="Masukkan password..." required
              />
            </div>
            <button type="submit" className="w-full bg-[#14429A] text-white font-semibold py-3 rounded-lg hover:bg-[#0f3070] transition-colors shadow-lg hover:shadow-blue-900/20">
              Masuk ke Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Tampilan Halaman Dashboard Utama
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar Admin */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/image_5ffce0.png" alt="Intikom Logo" className="h-8 object-contain" />
          <div className="h-8 w-px bg-gray-200"></div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">AI Knowledge Dashboard</h1>
            <p className="text-[11px] text-gray-500">Connected to Azure AI Search</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium">
          <LogOut size={16} /> Keluar Admin
        </button>
      </nav>

      {/* Konten Utama */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        
        {/* Notifikasi Global */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm border
            ${notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel Upload (Kiri) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Unggah Dokumen</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">Pilih file PDF untuk ditambahkan ke dalam otak AI. Teks akan diproses dan diubah menjadi vektor di Azure.</p>
              
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
                  ${isUploading ? 'bg-gray-50 border-gray-300' : 'border-[#14429A]/30 hover:border-[#14429A] hover:bg-blue-50/50 bg-white'}`}
              >
                <input type="file" multiple accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading} />
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin text-[#14429A] mb-4" size={32} />
                    <p className="font-semibold text-[#14429A]">Memproses & Sinkronisasi...</p>
                    <p className="text-xs text-gray-500 mt-2">Mohon tunggu, sedang mengirim ke Azure.</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#14429A]">
                      <Paperclip size={24} />
                    </div>
                    <p className="font-bold text-gray-700">Pilih File PDF</p>
                    <p className="text-xs text-gray-400 mt-2">Bisa memilih lebih dari 1 file</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabel Dokumen (Kanan) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-800">Daftar Dokumen Terindeks</h2>
                <button onClick={fetchFiles} disabled={isLoading} className="text-sm text-[#14429A] hover:underline font-medium flex items-center gap-1">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : null} Refresh Data
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Nama File</th>
                      <th className="px-6 py-4">Ukuran</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading && files.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                          <Loader2 className="animate-spin mx-auto mb-2 text-[#14429A]" size={24} /> Memuat data dari Azure...
                        </td>
                      </tr>
                    ) : files.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                          <FileText className="mx-auto mb-3 text-gray-300" size={32} />
                          Belum ada dokumen yang diunggah. Basis data AI kosong.
                        </td>
                      </tr>
                    ) : (
                      files.map((file, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                            <FileText size={18} className="text-[#14429A]" /> {file.filename}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleDelete(file.filename)}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-flex"
                              title="Hapus File dan Memori AI"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

// --- KOMPONEN HALAMAN UTAMA (LANDING PAGE INTIKOM) ---
function LandingPage({ onOpenAdmin }) {
  // (Komponen UI Bawaan Intikom)
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/10 bg-[#103070]/95 backdrop-blur-md shadow-lg py-3`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-white px-2 py-1.5 rounded shadow-sm">
               <img src="/image_5ffce0.png" alt="Intikom Logo" className="h-8 md:h-10 object-contain" />
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-7">
            {['Solutions', 'Products', 'Services', 'About', 'Resources', 'Support'].map((link, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-white/90 hover:text-white cursor-pointer text-[14px] font-medium transition-colors group">
                {link} <ChevronDown size={14} className="opacity-70 group-hover:opacity-100" />
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <button className="text-white/90 hover:text-white transition-colors"><Search size={20} /></button>
            <button className="bg-[#E01E26] hover:bg-[#c91820] text-white px-6 py-2.5 rounded-md font-semibold transition-all shadow-md hover:shadow-lg text-sm tracking-wide">Contact Us</button>
          </div>
          <div className="lg:hidden text-white cursor-pointer"><Menu size={28} /></div>
        </div>
      </nav>

      <div className="relative h-screen min-h-[600px] flex items-center bg-[#0a1930] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop")', opacity: 0.3 }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#14429A]/90 via-[#14429A]/70 to-transparent mix-blend-multiply"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.15] mb-6 drop-shadow-lg">
              Enhance Interconnectivity with Our Transmission Network Solutions
            </h1>
            <p className="text-lg md:text-xl text-blue-50/90 mb-10 leading-relaxed max-w-xl font-light">
              Enhance the speed, reliability, and efficiency of your telco business with Intikom's advanced transmission network solutions.
            </p>
            <button className="bg-[#E01E26] hover:bg-[#c91820] text-white px-8 py-3.5 rounded-md font-semibold transition-all flex items-center gap-2 shadow-lg">
              Learn More <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-[#0f244a] text-white pt-16 pb-8 border-t-[4px] border-[#E01E26]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="bg-white inline-block px-3 py-2 rounded mb-6"><img src="/image_5ffce0.png" alt="Intikom Logo" className="h-10 object-contain" /></div>
              <p className="text-blue-100/70 text-sm leading-relaxed max-w-md">
                PT. Intikom Berlian Mustika adalah penyedia solusi IT terkemuka di Indonesia, berdedikasi untuk mendorong transformasi digital melalui infrastruktur, layanan, dan inovasi yang handal.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-5 tracking-wide">Company</h4>
              <ul className="space-y-3 text-sm text-blue-100/70">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-5 tracking-wide">Solutions</h4>
              <ul className="space-y-3 text-sm text-blue-100/70">
                <li><a href="#" className="hover:text-white transition-colors">Cloud Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cyber Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-blue-100/50">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} PT. Intikom Berlian Mustika. All rights reserved.</p>
              <span className="hidden md:inline text-white/20">|</span>
              {/* TOMBOL RAHASIA MENUJU ADMIN DIPINDAH KE KIRI */}
              <button onClick={onOpenAdmin} className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-blue-300">
                <ShieldAlert size={12}/> Admin Portal
              </button>
            </div>
            <div className="flex gap-6 mt-4 md:mt-0 md:mr-24">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// --- MAIN APP ---
export default function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main' atau 'admin'

  return (
    <div className="min-h-screen font-sans relative selection:bg-[#E01E26] selection:text-white">
      {/* Pengatur Kondisi Halaman */}
      {currentView === 'main' ? (
        <>
          <LandingPage onOpenAdmin={() => setCurrentView('admin')} />
          <ChatWidget />
        </>
      ) : (
        <AdminDashboard onLogout={() => setCurrentView('main')} />
      )}
    </div>
  );
}