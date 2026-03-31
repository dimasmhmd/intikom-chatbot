import os
import tempfile
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import pdfplumber
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceExistsError

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# Load Environment Variables
load_dotenv()

app = FastAPI(title="Azure RAG Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfigurasi Azure OpenAI & Search
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_VERSION = "2023-12-01-preview"

AZURE_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AZURE_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

# PERBAIKAN: Kita ubah nama index agar LangChain membuat index baru yang skemanya cocok 100%
INDEX_NAME = "intikom-bot-index" 
CONTAINER_NAME = "pdf-documents" 

# Inisialisasi Model Azure
try:
    embeddings = AzureOpenAIEmbeddings(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_API_KEY,
        azure_deployment="text-embedding-ada-002", 
        openai_api_version=AZURE_OPENAI_API_VERSION,
    )

    llm = AzureChatOpenAI(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_API_KEY,
        azure_deployment="gpt-4.1-mini-deploy", # <--- UPDATE NAMA DEPLOYMENT BARU
        openai_api_version=AZURE_OPENAI_API_VERSION,
        temperature=0.2,
    )

    vector_store = AzureSearch(
        azure_search_endpoint=AZURE_SEARCH_ENDPOINT,
        azure_search_key=AZURE_SEARCH_KEY,
        index_name=INDEX_NAME,
        embedding_function=embeddings.embed_query,
    )
    print("Berhasil terhubung ke semua model Azure!")
except Exception as e:
    print(f"Warning: Konfigurasi Azure belum lengkap. Error: {e}")

# In-memory session history
session_history = {}

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/api/upload")
async def upload_pdf(files: List[UploadFile] = File(...)):
    try:
        if not AZURE_STORAGE_CONNECTION_STRING:
            raise HTTPException(status_code=500, detail="AZURE_STORAGE_CONNECTION_STRING belum diatur.")

        blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        
        try:
            blob_service_client.create_container(CONTAINER_NAME)
        except ResourceExistsError:
            pass 

        from langchain_core.documents import Document
        docs = []

        for file in files:
            # 1. Simpan file fisik ke Azure Blob Storage (sebagai backup)
            blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=file.filename)
            file_bytes = await file.read()
            blob_client.upload_blob(file_bytes, overwrite=True)
            
            # 2. Ekstrak teks untuk dimasukkan ke Azure AI Search
            text = ""
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
                temp.write(file_bytes)
                temp_path = temp.name
            
            with pdfplumber.open(temp_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted: text += extracted + "\n"
            os.remove(temp_path)
            
            if text.strip():
                docs.append(Document(page_content=text, metadata={"source": file.filename}))
        
        # 3. Potong teks dan masukkan ke AI Search menggunakan LangChain
        if docs:
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
            splits = splitter.split_documents(docs)
            vector_store.add_documents(documents=splits)
            return {"message": f"{len(files)} file disimpan ke Blob Storage & {len(splits)} chunks berhasil diindeks ke Azure Search."}
        else:
            return {"message": "File disimpan, tapi tidak ada teks yang bisa dibaca."}
    
    except Exception as e:
        print("\n=== DETAIL ERROR UPLOAD ===")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        if request.session_id not in session_history:
            session_history[request.session_id] = []
        history = session_history[request.session_id]

        prompt = ChatPromptTemplate.from_messages([
            ("system", "Anda adalah asisten AI dari Intikom. Jawablah menggunakan konteks yang diberikan secara profesional. Konteks: {context}"),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])

        retriever = vector_store.as_retriever()
        qa_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, qa_chain)

        response = rag_chain.invoke({
            "input": request.message,
            "chat_history": history
        })
        
        answer = response["answer"]

        # Update History
        history.append(HumanMessage(content=request.message))
        history.append(AIMessage(content=answer))
        if len(history) > 20: session_history[request.session_id] = history[-20:]

        return {"answer": answer}
    except Exception as e:
        print("\n=== DETAIL ERROR CHAT ===")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))