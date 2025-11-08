import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, Paperclip, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
`;

const ChatTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 1rem;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 1rem;
  border-radius: 15px;
  background: ${props => props.isUser ? '#007bff' : '#f1f3f4'};
  color: ${props => props.isUser ? 'white' : '#333'};
  word-wrap: break-word;
`;

const MessageContent = styled.div`
  line-height: 1.5;
  
  pre {
    background: ${props => props.isUser ? 'rgba(255,255,255,0.2)' : '#f8f9fa'};
    padding: 0.5rem;
    border-radius: 5px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }
  
  code {
    background: ${props => props.isUser ? 'rgba(255,255,255,0.2)' : '#f8f9fa'};
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid #e1e5e9;
  background: white;
`;

const InputForm = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  min-height: 50px;
  max-height: 120px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const DocumentSelector = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #dee2e6;
`;

const DocumentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const DocumentTag = styled.div`
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-style: italic;
`;

const LoadingDots = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ChatInterface({ selectedConversation, setSelectedConversation }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/conversations/${selectedConversation}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);

    // Add user message to UI immediately
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await axios.post(`/api/chat/conversations/${selectedConversation}/messages`, {
        message: userMessage,
        documentIds: selectedDocuments
      });

      const aiMessage = {
        id: response.data.messageId,
        role: 'assistant',
        content: response.data.message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = (docId) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const removeDocument = (docId) => {
    setSelectedDocuments(prev => prev.filter(id => id !== docId));
  };

  if (!selectedConversation) {
    return (
      <ChatContainer>
        <ChatHeader>
          <ChatTitle>Select a conversation to start chatting</ChatTitle>
        </ChatHeader>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666',
          fontSize: '1.1rem'
        }}>
          Choose a conversation from the sidebar or create a new one
        </div>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Chat</ChatTitle>
      </ChatHeader>

      <MessagesContainer>
        {messages.map((message) => (
          <Message key={message.id} isUser={message.role === 'user'}>
            <MessageBubble isUser={message.role === 'user'}>
              <MessageContent isUser={message.role === 'user'}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </MessageContent>
            </MessageBubble>
          </Message>
        ))}
        
        {loading && (
          <Message>
            <MessageBubble>
              <LoadingMessage>
                <LoadingDots />
                AI is thinking...
              </LoadingMessage>
            </MessageBubble>
          </Message>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {showDocumentSelector && (
        <DocumentSelector>
          <h4>Select documents to include in context:</h4>
          <DocumentList>
            {documents.map(doc => (
              <DocumentTag key={doc.id}>
                {doc.original_name}
                <RemoveButton onClick={() => toggleDocument(doc.id)}>
                  {selectedDocuments.includes(doc.id) ? '×' : '+'}
                </RemoveButton>
              </DocumentTag>
            ))}
          </DocumentList>
        </DocumentSelector>
      )}

      <InputContainer>
        <InputForm onSubmit={handleSubmit}>
          <MessageInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <SendButton
            type="button"
            onClick={() => setShowDocumentSelector(!showDocumentSelector)}
            title="Toggle document selector"
          >
            <Paperclip size={20} />
          </SendButton>
          <SendButton type="submit" disabled={loading || !inputValue.trim()}>
            <Send size={20} />
          </SendButton>
        </InputForm>
      </InputContainer>
    </ChatContainer>
  );
}

export default ChatInterface;

