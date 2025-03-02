import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const memoryApi = {
  // Add a new memory
  addMemory: async (data) => {
    const formData = new FormData();
    formData.append('text', data.text);
    formData.append('date', data.date);
    formData.append('tags', JSON.stringify(data.tags));
    if (data.media) {
      formData.append('media', data.media);
    }
    
    const response = await api.post('/memories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Search memories
  searchMemories: async (params) => {
    const response = await api.get('/memories/search', { params });
    return response.data;
  },

  // Get timeline
  getTimeline: async (params) => {
    const response = await api.get('/memories/timeline', { params });
    return response.data;
  },

  // Get mood map
  getMoodMap: async () => {
    const response = await api.get('/memories/moodmap');
    return response.data;
  },
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server';
  } else {
    // Request setup error
    return 'Error setting up request';
  }
}; 