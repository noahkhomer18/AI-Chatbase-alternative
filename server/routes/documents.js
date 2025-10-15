const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { db } = require('../database/init');
const { verifyToken } = require('./auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Allowed: PDF, DOCX, TXT, MD'));
    }
  }
});

// Extract text from different file types
const extractTextFromFile = async (filePath, fileType) => {
  try {
    switch (fileType) {
      case '.pdf':
        const pdfData = await pdfParse(fs.readFileSync(filePath));
        return pdfData.text;
      
      case '.docx':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        return docxResult.value;
      
      case '.txt':
      case '.md':
        return fs.readFileSync(filePath, 'utf8');
      
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
};

// Upload document
router.post('/upload', verifyToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    
    // Extract text content
    const content = await extractTextFromFile(filePath, fileType);
    
    // Save document to database
    db.run(
      `INSERT INTO documents (user_id, filename, original_name, file_type, file_size, content) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, req.file.filename, req.file.originalname, fileType, req.file.size, content],
      function(err) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        if (err) {
          return res.status(500).json({ error: 'Failed to save document' });
        }

        res.json({
          id: this.lastID,
          filename: req.file.originalname,
          fileType: fileType,
          fileSize: req.file.size,
          content: content.substring(0, 500) + (content.length > 500 ? '...' : '') // Preview
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// Get user's documents
router.get('/', verifyToken, (req, res) => {
  db.all(
    'SELECT id, original_name, file_type, file_size, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(documents);
    }
  );
});

// Get document content
router.get('/:id', verifyToken, (req, res) => {
  const documentId = req.params.id;
  
  db.get(
    'SELECT * FROM documents WHERE id = ? AND user_id = ?',
    [documentId, req.userId],
    (err, document) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(document);
    }
  );
});

// Delete document
router.delete('/:id', verifyToken, (req, res) => {
  const documentId = req.params.id;
  
  db.run(
    'DELETE FROM documents WHERE id = ? AND user_id = ?',
    [documentId, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json({ success: true });
    }
  );
});

// Search documents
router.get('/search/:query', verifyToken, (req, res) => {
  const query = req.params.query;
  
  db.all(
    `SELECT id, original_name, file_type, file_size, created_at 
     FROM documents 
     WHERE user_id = ? AND (original_name LIKE ? OR content LIKE ?) 
     ORDER BY created_at DESC`,
    [req.userId, `%${query}%`, `%${query}%`],
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(documents);
    }
  );
});

module.exports = router;
