import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Login from './components/Login';
import Register from './components/Register';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('chat');
  const [selectedConversation, setSelectedConversation] = useState(null);

  if (loading) {
    return (
      <AppContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      </AppContainer>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <AppContainer>
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />
      <MainContent>
        {currentView === 'chat' && (
          <ChatInterface 
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        )}
        {currentView === 'documents' && <DocumentManager />}
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
