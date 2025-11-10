import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  verify: () => api.get('/api/auth/verify'),
};

export const chatService = {
  getConversations: () => api.get('/api/chat/conversations'),
  createConversation: (data) => api.post('/api/chat/conversations', data),
  getMessages: (conversationId) => api.get(`/api/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => api.post(`/api/chat/conversations/${conversationId}/messages`, data),
  deleteConversation: (conversationId) => api.delete(`/api/chat/conversations/${conversationId}`),
};

export const documentService = {
  upload: (formData) => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/api/documents'),
  getById: (documentId) => api.get(`/api/documents/${documentId}`),
  delete: (documentId) => api.delete(`/api/documents/${documentId}`),
  search: (query) => api.get(`/api/documents/search/${encodeURIComponent(query)}`),
};

export const trainingService = {
  createDataset: (formData) => api.post('/api/training/create-dataset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createDatasetFromUrls: (data) => api.post('/api/training/create-dataset-from-urls', data),
  getDatasets: () => api.get('/api/training/datasets'),
  getDataset: (datasetId) => api.get(`/api/training/datasets/${datasetId}`),
  deleteDataset: (datasetId) => api.delete(`/api/training/datasets/${datasetId}`),
  trainModel: (data) => api.post('/api/training/train', data),
  getModels: () => api.get('/api/training/models'),
  deleteModel: (modelId) => api.delete(`/api/training/models/${modelId}`),
};

export default api;
