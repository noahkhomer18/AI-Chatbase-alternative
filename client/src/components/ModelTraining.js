import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, Brain, Trash2, Play, FileText, Clock, CheckCircle } from 'lucide-react';
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#007bff' : '#dee2e6'};
  border-radius: 10px;
  padding: 3rem;
  text-align: center;
  background: ${props => props.isDragActive ? '#f8f9fa' : 'white'};
  transition: all 0.3s;
  cursor: pointer;
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#007bff'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#c82333' : '#0056b3'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const Card = styled.div`
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  padding: 1.5rem;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  color: #333;
  margin: 0;
  font-size: 1.1rem;
`;

const StatusBadge = styled.span`
  background: ${props => {
    switch(props.status) {
      case 'completed': return '#28a745';
      case 'training': return '#ffc107';
      case 'processing': return '#17a2b8';
      default: return '#6c757d';
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CardContent = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
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

function ModelTraining() {
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    datasetName: '',
    description: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDatasets();
    fetchModels();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get('/api/training/datasets');
      setDatasets(response.data);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/training/models');
      setModels(response.data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.datasetName || uploadedFiles.length === 0) {
      setError('Dataset name and at least one file are required');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('datasetName', formData.datasetName);
      formDataToSend.append('description', formData.description);
      
      uploadedFiles.forEach(fileObj => {
        formDataToSend.append('trainingFiles', fileObj.file);
      });

      const response = await axios.post('/api/training/create-dataset', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData({ datasetName: '', description: '' });
      setUploadedFiles([]);
      setShowCreateForm(false);
      fetchDatasets();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create dataset');
    } finally {
      setUploading(false);
    }
  };

  const startTraining = async (datasetId, modelName) => {
    try {
      const response = await axios.post('/api/training/train', {
        datasetId,
        modelName: modelName || `Model-${Date.now()}`
      });
      
      fetchModels();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to start training');
    }
  };

  const deleteDataset = async (datasetId) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;

    try {
      await axios.delete(`/api/training/datasets/${datasetId}`);
      fetchDatasets();
    } catch (error) {
      setError('Failed to delete dataset');
    }
  };

  const deleteModel = async (modelId) => {
    if (!window.confirm('Are you sure you want to delete this model?')) return;

    try {
      await axios.delete(`/api/training/models/${modelId}`);
      fetchModels();
    } catch (error) {
      setError('Failed to delete model');
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading training data...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Brain size={32} />
          Model Training
        </Title>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Upload size={20} />
          Create Dataset
        </Button>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {showCreateForm && (
        <Section>
          <SectionTitle>Create Training Dataset</SectionTitle>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Dataset Name</Label>
              <Input
                type="text"
                value={formData.datasetName}
                onChange={(e) => setFormData({...formData, datasetName: e.target.value})}
                placeholder="Enter dataset name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your training data"
              />
            </FormGroup>

            <FormGroup>
              <Label>Training Files</Label>
              <UploadArea {...getRootProps()} isDragActive={isDragActive}>
                <input {...getInputProps()} />
                <UploadText>
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop training files here, or click to select'
                  }
                </UploadText>
                <UploadButton type="button">
                  <Upload size={20} />
                  Select Files
                </UploadButton>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  Supported: TXT, MD, JSON, CSV (Max 50MB each)
                </div>
              </UploadArea>

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Selected Files:</h4>
                  {uploadedFiles.map((fileObj, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.5rem',
                      background: '#f8f9fa',
                      borderRadius: '5px',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <FileText size={16} style={{ marginRight: '0.5rem' }} />
                        {fileObj.name} ({formatFileSize(fileObj.size)})
                      </div>
                      <Button 
                        type="button" 
                        variant="danger" 
                        onClick={() => removeFile(index)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Creating...' : 'Create Dataset'}
              </Button>
              <Button type="button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Section>
      )}

      <Section>
        <SectionTitle>Training Datasets</SectionTitle>
        {datasets.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No datasets created yet. Create your first dataset to start training models.
          </div>
        ) : (
          <Grid>
            {datasets.map(dataset => (
              <Card key={dataset.id}>
                <CardHeader>
                  <CardTitle>{dataset.name}</CardTitle>
                  <StatusBadge status={dataset.status}>
                    {dataset.status === 'completed' && <CheckCircle size={12} />}
                    {dataset.status === 'training' && <Clock size={12} />}
                    {dataset.status === 'processing' && <Clock size={12} />}
                    {dataset.status}
                  </StatusBadge>
                </CardHeader>
                <CardContent>
                  <div>{dataset.description || 'No description'}</div>
                  <div>Files: {dataset.file_count}</div>
                  <div>Created: {formatDate(dataset.created_at)}</div>
                </CardContent>
                <CardActions>
                  <Button onClick={() => startTraining(dataset.id)}>
                    <Play size={16} />
                    Train Model
                  </Button>
                  <Button variant="danger" onClick={() => deleteDataset(dataset.id)}>
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Grid>
        )}
      </Section>

      <Section>
        <SectionTitle>Trained Models</SectionTitle>
        {models.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No models trained yet. Create a dataset and start training to see your models here.
          </div>
        ) : (
          <Grid>
            {models.map(model => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <StatusBadge status={model.status}>
                    {model.status === 'completed' && <CheckCircle size={12} />}
                    {model.status === 'training' && <Clock size={12} />}
                    {model.status}
                  </StatusBadge>
                </CardHeader>
                <CardContent>
                  <div>Dataset: {model.dataset_name}</div>
                  <div>Created: {formatDate(model.created_at)}</div>
                  {model.completed_at && (
                    <div>Completed: {formatDate(model.completed_at)}</div>
                  )}
                </CardContent>
                <CardActions>
                  <Button variant="danger" onClick={() => deleteModel(model.id)}>
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Grid>
        )}
      </Section>
    </Container>
  );
}

export default ModelTraining;

