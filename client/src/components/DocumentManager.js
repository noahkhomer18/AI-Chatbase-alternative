import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, FileText, Trash2, Search, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 1rem;
  width: 300px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const UploadSection = styled.div`
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: border-color 0.3s;

  &.drag-active {
    border-color: #007bff;
    background: #e3f2fd;
  }
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
`;

const UploadButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  transition: background-color 0.3s;

  &:hover {
    background: #0056b3;
  }
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const DocumentCard = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  padding: 1.5rem;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DocumentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const DocumentName = styled.h3`
  color: #333;
  font-size: 1.1rem;
  margin: 0;
  word-break: break-word;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;
  transition: color 0.3s;

  &:hover {
    color: #333;
  }
`;

const DocumentInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const DocumentPreview = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  font-size: 0.9rem;
  color: #555;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to fetch documents');
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    setError('');
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('document', file);

      try {
        const response = await axios.post('/api/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setDocuments(prev => [response.data, ...prev]);
      } catch (error) {
        setError(`Failed to upload ${file.name}: ${error.response?.data?.error || 'Unknown error'}`);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`/api/documents/${documentId}`);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      setError('Failed to delete document');
      console.error('Failed to delete document:', error);
    }
  };

  const searchDocuments = async () => {
    if (!searchQuery.trim()) {
      fetchDocuments();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/documents/search/${encodeURIComponent(searchQuery)}`);
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to search documents');
      console.error('Failed to search documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>Document Manager</Title>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchDocuments()}
          />
          <button onClick={searchDocuments}>
            <Search size={20} />
          </button>
        </SearchContainer>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <UploadSection {...getRootProps()} className={isDragActive ? 'drag-active' : ''}>
        <input {...getInputProps()} />
        <UploadText>
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'
          }
        </UploadText>
        <UploadButton>
          <Upload size={20} />
          Upload Documents
        </UploadButton>
        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
          Supported formats: PDF, DOCX, TXT, MD (Max 10MB)
        </div>
      </UploadSection>

      {loading ? (
        <LoadingMessage>Loading documents...</LoadingMessage>
      ) : (
        <DocumentsGrid>
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id}>
              <DocumentHeader>
                <DocumentName>{document.original_name}</DocumentName>
                <DocumentActions>
                  <ActionButton title="Download">
                    <Download size={16} />
                  </ActionButton>
                  <ActionButton 
                    title="Delete"
                    onClick={() => deleteDocument(document.id)}
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </DocumentActions>
              </DocumentHeader>
              
              <DocumentInfo>
                <div>Type: {document.file_type.toUpperCase()}</div>
                <div>Size: {formatFileSize(document.file_size)}</div>
                <div>Uploaded: {formatDate(document.created_at)}</div>
              </DocumentInfo>
              
              <DocumentPreview>
                {document.content ? document.content.substring(0, 200) + '...' : 'No preview available'}
              </DocumentPreview>
            </DocumentCard>
          ))}
        </DocumentsGrid>
      )}

      {!loading && filteredDocuments.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#666', 
          padding: '2rem',
          fontSize: '1.1rem'
        }}>
          {searchQuery ? 'No documents found matching your search.' : 'No documents uploaded yet.'}
        </div>
      )}
    </Container>
  );
}

export default DocumentManager;

