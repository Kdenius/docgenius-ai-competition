# 📄 DocGenius AI

An AI-powered document question-answering platform that enables users to upload documents, automatically generate summaries, and ask natural language questions based on the uploaded content. DocGenius AI combines modern Natural Language Processing (NLP), semantic search, and Retrieval-Augmented Generation (RAG) techniques to provide accurate, context-aware responses.

The application is built using **FastAPI**, **React (Vite)**, **MongoDB**, **Sentence Transformers**, **FAISS**, and **Hugging Face Transformers**.

---

## ✨ Features

### 👤 User Management

- User Registration
- Secure Login
- JWT Authentication
- Password Hashing using BCrypt
- Email Verification
- Protected APIs

### 📂 Document Management

Supports multiple document formats:

- PDF
- DOCX
- TXT
- HTML

Features:

- Upload Documents
- Automatic Text Extraction
- Azure Blob Storage Integration
- Document Metadata Storage
- Document Size Tracking
- File Type Detection

### 🤖 AI Features

- Automatic Document Summarization
- Semantic Search
- Question Answering
- Context-Aware Responses
- Sentence Embeddings
- Vector Similarity Search
- Retrieval-Augmented Response Generation

### 💬 Chat System

Each uploaded document creates a dedicated chat session.

Users can:

- Ask Questions
- Receive AI-generated Answers
- View Chat History
- Delete Chat Sessions
- Manage Multiple Documents

---

## 🛠️ Technology Stack

| Category          | Technologies                                                                    |
| ----------------- | ------------------------------------------------------------------------------- |
| Frontend          | React, Vite, JavaScript                                                         |
| Styling           | CSS                                                                             |
| API Communication | Axios                                                                           |
| Backend           | FastAPI, Python                                                                 |
| Security          | JWT Authentication, BCrypt                                                      |
| Database          | MongoDB                                                                         |
| AI & NLP          | Hugging Face Transformers, Facebook BART, Sentence Transformers, FAISS, PyTorch |
| Cloud Storage     | Azure Blob Storage                                                              |
| Email Service     | FastAPI Mail                                                                    |
| Version Control   | Git & GitHub                                                                    |

---

## 🧠 AI Pipeline

```text
Document Upload
        │
        ▼
Text Extraction
        │
        ▼
Text Cleaning
        │
        ▼
Document Summary
        │
        ▼
Sentence Splitting
        │
        ▼
Sentence Embeddings
        │
        ▼
FAISS Vector Index
        │
        ▼
User Question
        │
        ▼
Semantic Search
        │
        ▼
Relevant Context
        │
        ▼
AI Generated Response
```

---

## ⚙️ Prerequisites

- Python 3.11+
- MongoDB
- Node.js 18+
- npm
- Git

---

## 📥 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Kdenius/docgenius-ai-competition.git
```

Navigate to the project:

```bash
cd docgenius-ai
```

---

### 2️⃣ Backend Setup

Navigate to the backend project:

```bash
cd FastApi
```

Create a virtual environment.

**Windows**

```bash
python -m venv venv

venv\Scripts\activate
```

**Linux / macOS**

```bash
python3 -m venv venv

source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the application:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

### 3️⃣ Frontend Setup

Navigate to the frontend project:

```bash
cd frontend/doc-gen-ai
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 🔧 Configuration

### MongoDB

```properties
MONGO_URI=mongodb://localhost:27017/docgenius
```

### JWT

```properties
JWT_SECRET_KEY=YOUR_SECRET_KEY
```

### Mail Configuration

```properties
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Verification URL

```properties
VARIFY_URL=http://localhost:5173
```

### Azure Blob Storage

```properties
AZURE_CONNECTION_STRING=YOUR_CONNECTION_STRING
AZURE_CONTAINER_NAME=documents
```

---

### Frontend

Create:

```text
frontend/doc-gen-ai/.env
```

```env
VITE_API_URL=http://localhost:8000
```

---

## 🤖 AI Models Used

### Document Summarization

Model:

```text
facebook/bart-large-cnn
```

Used for:

- Automatic Document Summary
- Response Summarization

### Sentence Embeddings

Model:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Used for:

- Semantic Search
- Embedding Generation
- Vector Search

### Vector Database

FAISS is used to:

- Build Embedding Index
- Search Similar Document Chunks
- Retrieve Relevant Information Efficiently

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint          | Description   |
| ------ | ----------------- | ------------- |
| POST   | `/signup`         | Register User |
| GET    | `/verify/{token}` | Verify Email  |
| POST   | `/login`          | User Login    |

### Chat

| Method | Endpoint        | Description                   |
| ------ | --------------- | ----------------------------- |
| POST   | `/chat/create`  | Upload Document & Create Chat |
| POST   | `/chat/message` | Ask Question                  |
| DELETE | `/chat/delete`  | Delete Chat                   |

---

## 📄 License

This project is developed for educational and research purposes. Feel free to modify and extend it according to your requirements.

© 2025 Doc Genius AI — Kishan Dervaliya | Yug Vithani | Prashant Kalsariya
