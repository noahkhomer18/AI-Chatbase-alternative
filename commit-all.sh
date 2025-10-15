#!/bin/bash

echo "🚀 Committing AI Chatbase Alternative to main branch..."

# Initialize git repository
git init

# Configure git user
git config user.name "Noah Homer"
git config user.email "noah@example.com"

# Add all files
git add .

# Commit everything
git commit -m "feat: initial commit - AI Chatbase Alternative

- Complete full-stack AI chat application
- React frontend with modern UI components  
- Node.js/Express backend with OpenAI integration
- SQLite database with user auth and chat storage
- Document upload and processing (PDF, DOCX, TXT, MD)
- JWT authentication system
- Responsive design with styled components
- Comprehensive documentation and setup guides"

# Set main branch
git branch -M main

echo "✅ All files committed to main branch!"
echo ""
echo "To push to GitHub:"
echo "1. Create repository on GitHub"
echo "2. Run: git remote add origin <your-repo-url>"
echo "3. Run: git push -u origin main"
echo ""
echo "🎉 Your AI Chatbase Alternative is ready!"
