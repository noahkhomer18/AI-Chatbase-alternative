# AI Chatbase Alternative

A modern, full-stack AI-powered chat application with document upload capabilities, built as an alternative to Chatbase.

## Features

- 🤖 **AI Chat Interface** - Powered by OpenAI GPT models
- 📄 **Document Upload** - Support for PDF, DOCX, TXT, and MD files
- 💬 **Conversation Management** - Create, manage, and organize chat conversations
- 🔍 **Document Search** - Search through uploaded documents
- 🔐 **User Authentication** - Secure login and registration
- 📱 **Responsive Design** - Modern, mobile-friendly interface
- 🎨 **Beautiful UI** - Clean and intuitive user experience

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **OpenAI API** for AI chat functionality
- **JWT** for authentication
- **Multer** for file uploads
- **PDF-parse** and **Mammoth** for document processing

### Frontend
- **React** with modern hooks
- **Styled Components** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Dropzone** for file uploads
- **React Markdown** for message rendering

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/noahkhomer18/AI-Chatbase-alternative.git
   cd AI-Chatbase-alternative
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend client (port 3000).

### Usage

1. **Register/Login** - Create an account or sign in
2. **Upload Documents** - Go to Documents tab and upload PDF, DOCX, TXT, or MD files
3. **Start Chatting** - Create a new conversation and start chatting with AI
4. **Use Documents** - Select documents to include in your chat context

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id/messages` - Get conversation messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/search/:query` - Search documents

## Project Structure

```
ai-chatbase-alternative/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/           # API routes
│   ├── database/         # Database setup
│   ├── uploads/          # File uploads
│   └── index.js
├── package.json          # Root package.json
└── README.md
```

## Features in Detail

### Document Processing
- **PDF**: Extracts text using pdf-parse
- **DOCX**: Extracts text using mammoth
- **TXT/MD**: Direct text reading
- **Search**: Full-text search across all documents

### AI Integration
- Uses OpenAI's GPT-3.5-turbo model
- Context-aware responses using uploaded documents
- Conversation history maintained
- Streaming responses (future enhancement)

### Security
- JWT-based authentication
- Password hashing with bcrypt
- File type validation
- File size limits (10MB)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Database
The application uses SQLite for simplicity. The database is automatically created on first run.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ as an open-source alternative to Chatbase.

