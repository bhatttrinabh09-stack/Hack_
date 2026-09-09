import axios from 'axios';
import { useStore } from '../store/useStore';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2. For iOS/Web, it's localhost or 127.0.0.1.
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://127.0.0.1:8000';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string = 'password123') => {
    const response = await apiClient.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    return response.data;
  },
  signup: async (
    email: string,
    password: string = 'password123',
    name: string = 'Student',
    branch: string = 'AIML',
    semester: number = 3
  ) => {
    const response = await apiClient.post('/auth/signup', {
      name: name.trim() || 'Student',
      email: email.trim().toLowerCase(),
      password: password.trim() || 'password123',
      branch,
      semester,
    });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/user/me');
    return response.data;
  },
};

export const catalogApi = {
  getBranches: async () => {
    const response = await apiClient.get('/branches');
    return response.data;
  },
  getSemesters: async () => {
    const response = await apiClient.get('/semesters');
    return response.data;
  },
  getSubjects: async (branch: string = 'AIML', semester: number = 3) => {
    const response = await apiClient.get('/subjects', {
      params: { branch, semester },
    });
    return response.data;
  },
  getTopics: async (subjectId: string) => {
    const response = await apiClient.get(`/subjects/${subjectId}/topics`);
    return response.data;
  },
};

export const cardsApi = {
  getSwipeCards: async (topicId: string) => {
    const response = await apiClient.get(`/topics/${topicId}/cards`);
    return response.data;
  },
};

export const contentApi = {
  getTopicContent: async (topicId: string, mode?: string) => {
    const response = await apiClient.get(`/topics/${topicId}/content`, {
      params: mode ? { mode } : undefined,
    });
    return response.data;
  },
};

export const panicApi = {
  setPanicSession: async (examIn: number = 24, unit: string = 'hours') => {
    const response = await apiClient.post('/panic-session', {
      examIn,
      unit,
    });
    return response.data;
  },
  getPanicSession: async () => {
    const response = await apiClient.get('/panic-session/active');
    return response.data;
  },
  endPanicSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/panic-session/${sessionId}`);
    return response.data;
  },
};

export const swipeApi = {
  recordSwipe: async (
    topicId: string,
    direction: 'right' | 'left',
    cardId?: string,
    cardType?: string
  ) => {
    const response = await apiClient.post('/swipe-event', {
      topicId,
      direction,
      cardId: cardId || `${topicId}-card`,
      cardType: cardType || 'dense',
    });
    return response.data;
  },
};

export const progressApi = {
  getProgress: async (subjectId: string = 'os-sem3-aiml') => {
    const response = await apiClient.get('/progress', {
      params: { subject_id: subjectId },
    });
    return response.data;
  },
  completeTopic: async (topicId: string, mode: string = 'dense') => {
    const response = await apiClient.post('/progress/complete', {
      topicId,
      mode,
    });
    return response.data;
  },
};

