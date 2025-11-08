// Error handling utilities

/**
 * Extract error message from error object
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error, setError) => {
  const message = getErrorMessage(error);
  setError(message);
  console.error('API Error:', error);
};

/**
 * Create error boundary message
 */
export const createErrorBoundaryMessage = (error, errorInfo) => {
  return {
    message: error.message || 'Something went wrong',
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
  };
};
