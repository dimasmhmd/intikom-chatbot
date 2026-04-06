🚀 Enterprise AI Chatbot Widget with Azure RAG

Sebuah widget chatbot cerdas (AI) level enterprise yang dirancang untuk diintegrasikan ke dalam website perusahaan secara mulus (Seamless UI). Proyek ini dibangun dengan arsitektur Retrieval-Augmented Generation (RAG) menggunakan ekosistem Microsoft Azure untuk memberikan respons yang akurat, kontekstual, dan eksklusif berdasarkan data internal perusahaan.

🎥 Demo & Visualisasi

(Catatan: Anda bisa mengganti teks di bawah ini dengan tautan GIF atau Video yang sesungguhnya saat mengunggahnya ke GitHub/Portofolio Anda)

Lihat Live Demo: [Tautan ke Vercel atau Website Intikom Anda]

Video singkat di atas mendemonstrasikan bagaimana widget chatbot ini dapat diklik dan langsung memberikan respons cerdas secara real-time, melayang (floating) dengan elegan di atas halaman website yang sedang aktif tanpa mengganggu navigasi pengguna.

🧠 "Otak" di Balik Chatbot (AI & Backend Architecture)

Chatbot ini tidak sekadar menggunakan API AI biasa yang berhalusinasi. Bot ini dikunci untuk hanya menjawab berdasarkan dokumen resmi perusahaan (seperti Company Profile PT Intikom Berlian Mustika). Hal ini dicapai melalui arsitektur canggih berikut:

Retrieval-Augmented Generation (RAG): Menggunakan framework LangChain, sistem akan membaca, memotong (chunking), dan memahami dokumen PDF internal perusahaan. Saat pengguna bertanya, sistem hanya akan mencari konteks yang relevan dari dokumen tersebut sebelum menjawab.

Vector Database (Memory): Memanfaatkan Azure AI Search (atau FAISS untuk versi lokal) untuk menyimpan jutaan potongan teks dokumen sebagai vektor, memungkinkan pencarian semantik (Semantic Search) dalam hitungan milidetik.

Large Language Model (LLM): Menggunakan Azure OpenAI (gpt-4.1-mini-deploy) sebagai model bahasa utama untuk memproses konteks dan merangkai jawaban dengan gaya bahasa yang profesional dan manusiawi.

Embeddings: Menggunakan model Azure text-embedding-ada-002 untuk mengubah teks dokumen menjadi angka (vektor).

Backend Cepat & Asinkron: Dibangun menggunakan Python FastAPI, memastikan lalu lintas data antara frontend dan Azure Cloud berjalan sangat ringan, aman, dan scalable.

✨ Aspek UI/UX & Interaksi Pengguna (Frontend)

Antarmuka pengguna (UI) dirancang dengan mempertimbangkan pengalaman pengguna (UX) yang modern, tidak kaku, dan mudah digunakan di perangkat apa pun:

Modern & Smooth Design: Dibangun menggunakan React.js dan di-styling sepenuhnya dengan Tailwind CSS. Setiap interaksi—mulai dari membuka chat, memperbesar jendela (maximize), hingga animasi loading (typing indicator)—dilengkapi dengan transisi CSS yang sangat halus (smooth).

Mobile-Friendly & Responsive: Widget dirancang agar terlihat proporsional di layar desktop dan otomatis menyesuaikan diri (adaptif) saat dibuka melalui layar smartphone.

Fitur "Expand" (Layar Penuh): Memiliki tombol Maximize yang akan membentangkan layar obrolan secara presisi dengan margin yang simetris, memberikan kenyamanan ekstra saat pengguna membaca teks yang panjang.

Tipografi & Ikonografi Profesional: Menggunakan pustaka ikon Lucide React yang renyah dan tajam. Hasil keluaran (output) AI seperti bold (huruf tebal) dan bullet points (daftar/list) di-render secara kustom agar sangat mudah dan nyaman dibaca (High Legibility).

Seamless Integration: Komponen dirancang secara terisolasi (Isolated Component) sehingga dapat dengan mudah ditempel (di-embed) ke website lain (WordPress, PHP, HTML murni) hanya dengan memanggil satu baris kode JavaScript.

🛠️ Tech Stack yang Digunakan

Frontend:

React.js (Vite)

Tailwind CSS (Utility-first styling)

Lucide React (Iconography)

Backend & AI:

Python (FastAPI)

Microsoft Azure OpenAI (LLM & Embeddings)

Microsoft Azure AI Search (Vector Database)

LangChain (LLM Orchestration)

PDFPlumber (Document Extraction)

💡 Fitur Utama (Key Features)

Strict Contextual QA: AI menolak menjawab pertanyaan di luar konteks bisnis perusahaan (mencegah knowledge bleed seperti memberikan kode SQL atau resep masakan).

Context Upload Dashboard: Admin dapat mengunggah (upload) PDF baru, dan AI akan langsung mempelajari isinya secara real-time.

Conversation Memory: AI mampu mengingat hingga 20 interaksi terakhir, memungkinkan obrolan berlanjut secara natural (Follow-up questions).

Auto Formatting: Jawaban AI diformat secara otomatis menjadi paragraf yang rapi, tulisan tebal, dan list dengan margin yang memanjakan mata.
