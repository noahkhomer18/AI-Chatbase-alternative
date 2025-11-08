// Application constants

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  DOCUMENTS: '/documents',
  TRAINING: '/training',
};

export const VIEWS = {
  CHAT: 'chat',
  DOCUMENTS: 'documents',
  TRAINING: 'training',
};

export const FILE_TYPES = {
  DOCUMENT: {
    PDF: '.pdf',
    DOCX: '.docx',
    TXT: '.txt',
    MD: '.md',
  },
  TRAINING: {
    TXT: '.txt',
    MD: '.md',
    JSON: '.json',
    CSV: '.csv',
  },
};

export const MAX_FILE_SIZES = {
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  TRAINING: 50 * 1024 * 1024,  // 50MB
};

export const STATUS = {
  PROCESSING: 'processing',
  TRAINING: 'training',
  COMPLETED: 'completed',
  READY: 'ready',
  ERROR: 'error',
};

export const STATUS_COLORS = {
  processing: 'info',
  training: 'warning',
  completed: 'success',
  ready: 'success',
  error: 'error',
};

export const MESSAGES = {
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized. Please login again.',
    NOT_FOUND: 'Resource not found.',
    SERVER: 'Server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
  },
  SUCCESS: {
    SAVED: 'Saved successfully!',
    DELETED: 'Deleted successfully!',
    UPLOADED: 'Uploaded successfully!',
    CREATED: 'Created successfully!',
  },
};
