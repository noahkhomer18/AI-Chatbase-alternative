const express = require('express');
const OpenAI = require('openai');
const { db } = require('../database/init');
const { verifyToken } = require('./auth');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get all conversations for a user
router.get('/conversations', verifyToken, (req, res) => {
  db.all(
    `SELECT c.*, 
     COUNT(m.id) as message_count,
     MAX(m.created_at) as last_message_at
     FROM conversations c 
     LEFT JOIN messages m ON c.id = m.conversation_id 
     WHERE c.user_id = ? 
     GROUP BY c.id 
     ORDER BY c.updated_at DESC`,
    [req.userId],
    (err, conversations) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(conversations);
    }
  );
});

// Get messages for a conversation
router.get('/conversations/:id/messages', verifyToken, (req, res) => {
  const conversationId = req.params.id;
  
  db.all(
    `SELECT m.* FROM messages m 
     JOIN conversations c ON m.conversation_id = c.id 
     WHERE c.id = ? AND c.user_id = ? 
     ORDER BY m.created_at ASC`,
    [conversationId, req.userId],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(messages);
    }
  );
});

// Create new conversation
router.post('/conversations', verifyToken, (req, res) => {
  const { title } = req.body;
  
  db.run(
    'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
    [req.userId, title || 'New Conversation'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create conversation' });
      }
      res.json({ id: this.lastID, title: title || 'New Conversation' });
    }
  );
});

// Send message and get AI response
router.post('/conversations/:id/messages', verifyToken, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { message, documentIds = [] } = req.body;

    // Verify conversation belongs to user
    db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, req.userId],
      async (err, conversation) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }

        // Save user message
        db.run(
          'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
          [conversationId, 'user', message],
          async function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to save message' });
            }

            // Get conversation history
            db.all(
              'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
              [conversationId],
              async (err, messages) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }

                // Get document content if documentIds provided
                let documentContent = '';
                if (documentIds.length > 0) {
                  const placeholders = documentIds.map(() => '?').join(',');
                  db.all(
                    `SELECT content FROM documents WHERE id IN (${placeholders}) AND user_id = ?`,
                    [...documentIds, req.userId],
                    (err, documents) => {
                      if (!err && documents.length > 0) {
                        documentContent = documents.map(doc => doc.content).join('\n\n');
                      }
                    }
                  );
                }

                // Prepare messages for OpenAI
                const systemMessage = {
                  role: 'system',
                  content: `You are a helpful AI assistant. ${documentContent ? `Here is some context from uploaded documents:\n\n${documentContent}\n\nUse this information to help answer questions.` : ''}`
                };

                const openaiMessages = [systemMessage, ...messages.map(msg => ({
                  role: msg.role,
                  content: msg.content
                }))];

                try {
                  // Get AI response
                  const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: openaiMessages,
                    max_tokens: 1000,
                    temperature: 0.7
                  });

                  const aiResponse = completion.choices[0].message.content;

                  // Save AI response
                  db.run(
                    'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
                    [conversationId, 'assistant', aiResponse],
                    function(err) {
                      if (err) {
                        return res.status(500).json({ error: 'Failed to save AI response' });
                      }

                      // Update conversation timestamp
                      db.run(
                        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [conversationId]
                      );

                      res.json({
                        message: aiResponse,
                        messageId: this.lastID
                      });
                    }
                  );
                } catch (openaiError) {
                  console.error('OpenAI error:', openaiError);
                  res.status(500).json({ error: 'Failed to get AI response' });
                }
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete conversation
router.delete('/conversations/:id', verifyToken, (req, res) => {
  const conversationId = req.params.id;
  
  db.run(
    'DELETE FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;
