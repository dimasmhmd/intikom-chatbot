import React from 'react';
import ChatWidget from './ChatWidget';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-[#14429A] mb-4">Intikom - Integrasi Azure RAG</h1>
        <p className="text-gray-600 mb-8">
          Website ini terhubung dengan Backend FastAPI dan Azure AI Search + Azure OpenAI. <br/>
          Klik tombol chat merah di pojok kanan bawah untuk memulai percakapan atau mengunggah dokumen referensi (RAG).
        </p>
      </div>
      
      {/* Memanggil komponen Chatbot */}
      <ChatWidget />
    </div>
  );
}