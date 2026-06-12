import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua pelo IP do seu computador
// Exemplo: http://192.168.1.100:3333/api
const API_BASE_URL = 'http://192.168.1.69:3333/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@BeautyClinic:token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;