import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Login from './components/Login';
import Register from './components/Register';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import ModelTraining from './components/ModelTraining';
import Sidebar from './components/Sidebar';
import Loading from './components/ui/Loading';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VIEWS } from './constants';
import { theme } from './theme/theme';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: ${theme.colors.surface};
`;

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState(VIEWS.CHAT);
  const [selectedConversation, setSelectedConversation] = useState(null);

  if (loading) {
    return (
      <AppContainer>
        <Loading fullScreen text="Loading application..." />
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
        {currentView === VIEWS.CHAT && (
          <ChatInterface 
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        )}
        {currentView === VIEWS.DOCUMENTS && <DocumentManager />}
        {currentView === VIEWS.TRAINING && <ModelTraining />}
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
