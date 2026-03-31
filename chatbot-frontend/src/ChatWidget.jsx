import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, User, Paperclip, Loader2, FileText, Trash2, Settings } from 'lucide-react';

const API_BASE_URL = "https://dimasmhmd-intikom-backend.hf.space/api";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('rag_session_id');
    if (storedSession) setSessionId(storedSession);
    else {
      const newSession = 'sess_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('rag_session_id', newSession);
      setSessionId(newSession);
    }
    setMessages([{ role: 'ai', text: 'Halo! Saya asisten virtual Intikom (Powered by Azure). Ada yang bisa saya bantu?' }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, showUpload, isTyping]);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles]);
    setIsUploading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Gagal mengunggah");
      
      setMessages(prev => [...prev, { role: 'ai', text: `Dokumen berhasil diindeks ke Azure AI Search! (${selectedFiles.map(f => f.name).join(', ')})` }]);
    } catch (error) {
      alert("Error saat mengunggah: Pastikan Backend Python menyala. " + error.message);
    } finally {
      setShowUpload(false); 
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        setMessages(prev => [...prev, { role: 'ai', text: "Terjadi kesalahan di server Azure." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Koneksi ke server terputus." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearSession = () => {
    const newSession = 'sess_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('rag_session_id', newSession);
    setSessionId(newSession);
    setMessages([{ role: 'ai', text: 'Sesi chat baru telah dimulai.' }]);
    setShowUpload(false);
    setFiles([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[340px] sm:w-96 h-[500px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right">
          
          <div className="bg-[#14429A] p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden shadow-sm">
                <img src="/image_69e9c5.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = '[https://via.placeholder.com/24?text=Bot](https://via.placeholder.com/24?text=Bot)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide">Intikom Support</h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1.5 opacity-90"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span> Azure RAG Active</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowUpload(!showUpload)} className="p-1.5 hover:bg-white/20 rounded-md transition duration-200" title="Pengetahuan AI (Admin)"><Settings size={18} /></button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition duration-200" title="Tutup Chat"><X size={20} /></button>
            </div>
          </div>

          {showUpload ? (
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col">
              <div className="mb-4"><h4 className="text-sm font-bold text-gray-800">Basis Pengetahuan AI</h4><p className="text-xs text-gray-500 mt-1">Unggah dokumen ke Azure AI Search.</p></div>
              <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 mb-4 ${isUploading ? 'bg-gray-100 border-gray-300' : 'border-[#14429A]/40 hover:border-[#14429A] hover:bg-blue-50 bg-white'}`}>
                <input type="file" multiple accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading} />
                {isUploading ? <><Loader2 className="animate-spin text-[#14429A] mb-3" size={28} /><p className="text-xs font-semibold text-[#14429A]">Upload ke Azure...</p></> : <><Paperclip className="text-[#14429A] mb-3 opacity-80" size={28} /><p className="text-sm font-semibold text-gray-700">Pilih File PDF</p></>}
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                <button onClick={clearSession} className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-[#E01E26] hover:bg-red-50 rounded-lg transition-colors border border-red-100"><Trash2 size={14} /> Hapus Histori Percakapan</button>
                <button onClick={() => setShowUpload(false)} className="w-full py-2.5 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors">Kembali ke Chat</button>
              </div>
            </div>
          ) : (
            <>
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
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan Anda di sini..." className="w-full pl-4 pr-12 py-3 bg-gray-100/80 border border-transparent rounded-full focus:outline-none focus:ring-1 focus:ring-[#14429A]/30 focus:bg-white text-[14px] transition-all" disabled={isTyping} />
                  <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-1.5 w-9 h-9 bg-[#E01E26] text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-sm"><Send size={16} className="ml-0.5" /></button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-105 active:scale-95 z-50 ${isOpen ? 'bg-[#E01E26] rotate-90' : 'bg-[#14429A] rotate-0'}`}>
        {isOpen ? <X className="text-white" size={28} /> : <MessageSquare className="text-white" size={26} />}
      </button>
    </div>
  );
}