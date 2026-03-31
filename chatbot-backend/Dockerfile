# Gunakan sistem operasi Linux dengan Python 3.11
FROM python:3.11-slim

# Pindah ke direktori /app di dalam server
WORKDIR /app

# Salin file daftar library dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh file kode Python Anda (termasuk main.py)
COPY . .

# Beritahu server bahwa kita menggunakan port 7860 (Wajib untuk Hugging Face)
EXPOSE 7860

# Jalankan server Uvicorn/FastAPI saat Space dinyalakan
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]