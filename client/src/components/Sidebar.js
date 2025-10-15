import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageCircle, FileText, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const SidebarContainer = styled.div`
  width: 300px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const UserIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #bdc3c7;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s;

  &:hover {
    color: white;
  }
`;

const Navigation = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #34495e;
`;

const NavButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${props => props.active ? '#3498db' : 'transparent'};
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.3s;

  &:hover {
    background: ${props => props.active ? '#2980b9' : '#34495e'};
  }
`;

const ConversationsSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  color: #bdc3c7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NewChatButton = styled.button`
  background: #27ae60;
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: background-color 0.3s;

  &:hover {
    background: #229954;
  }
`;

const ConversationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ConversationItem = styled.div`
  padding: 0.75rem;
  background: ${props => props.active ? '#34495e' : 'transparent'};
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: #34495e;
  }
`;

const ConversationTitle = styled.div`
  flex: 1;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ConversationDate = styled.div`
  font-size: 0.8rem;
  color: #bdc3c7;
`;

function Sidebar({ currentView, setCurrentView, selectedConversation, setSelectedConversation }) {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentView === 'chat') {
      fetchConversations();
    }
  }, [currentView]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post('/api/chat/conversations', {
        title: 'New Conversation'
      });
      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <SidebarContainer>
      <Header>
        <UserInfo>
          <UserIcon>
            <User size={20} />
          </UserIcon>
          <UserName>{user?.name || user?.email}</UserName>
        </UserInfo>
        <LogoutButton onClick={logout}>
          <LogOut size={16} />
          Logout
        </LogoutButton>
      </Header>

      <Navigation>
        <NavButton 
          active={currentView === 'chat'} 
          onClick={() => setCurrentView('chat')}
        >
          <MessageCircle size={20} />
          Chat
        </NavButton>
        <NavButton 
          active={currentView === 'documents'} 
          onClick={() => setCurrentView('documents')}
        >
          <FileText size={20} />
          Documents
        </NavButton>
      </Navigation>

      {currentView === 'chat' && (
        <ConversationsSection>
          <SectionHeader>
            <SectionTitle>Conversations</SectionTitle>
            <NewChatButton onClick={createNewConversation}>
              <Plus size={16} />
              New Chat
            </NewChatButton>
          </SectionHeader>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: '#bdc3c7' }}>Loading...</div>
          ) : (
            <ConversationList>
              {conversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  active={selectedConversation === conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <MessageCircle size={16} />
                  <ConversationTitle>
                    {conversation.title}
                  </ConversationTitle>
                  <ConversationDate>
                    {formatDate(conversation.updated_at)}
                  </ConversationDate>
                </ConversationItem>
              ))}
            </ConversationList>
          )}
        </ConversationsSection>
      )}
    </SidebarContainer>
  );
}

export default Sidebar;
