# Google NotebookLM Clone

A web app that lets users upload PDF files and chat with them using AI. Built using React and TypeScript on the frontend, with a Node.js backend.

## Live Demo

https://chipper-dango-bbd5c6.netlify.app/

## Running Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- OpenAI API key


**Note**: If you don't have an OpenAI API key or MongoDB URI, you can use the deployed backend URL in frontend `.env`:

```bash
VITE_BACKEND_BASE=https://pdf-assignment.onrender.com
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```bash
VITE_BACKEND_BASE=http://localhost:5000
```

Then run:
```bash
npm run dev
```

Frontend runs at http://localhost:3000

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```bash
PORT=500
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

Then run:
```bash
npm run dev
```


## Features

### PDF Upload & Viewing
- Upload and view large PDFs
- Drag & drop upload with progress
- Built-in responsive PDF viewer

### Chat with Documents
- Ask questions about the PDF content
- Real-time AI responses via chat
- Each response includes clickable citations to relevant PDF pages
- Each document futher is used to generate a hash, that permits to attach a chat history with it.

## Project Structure

### Frontend Structure
Code is structured to be modular and maintainable. Features are separated clearly, and shared components are reused wherever possible.

```
frontend/
├── src/
│   ├── features/
│   │   └── notebook/
│   │       ├── components/
│   │       │   ├── chat/
│   │       │   ├── entry/
│   │       │   └── pdf-viewer/
│   │       ├── services/
│   │       ├── context/
│   │       └── types/
│   ├── shared/
│   │   ├── components/
│   │   ├── constants/
│   │   └── context/
│   └── App.tsx
```


## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite + Tailwind CSS + Radix UI
- React Query, React PDF, React Dropzone
- WebSocket integration via Socket.IO

### Backend
- Node.js + Express + TypeScript
- MongoDB with Mongoose
- OpenAI API integration
- Socket.IO for real-time communication


## Notes

- The backend logic (API, vectorization, AI integration, etc.) was implemented with help from AI tools
- The frontend is clean, well-structured, and follows modern best practices
- All assignment requirements were completed

## License

This project is for demonstration and educational purposes only.