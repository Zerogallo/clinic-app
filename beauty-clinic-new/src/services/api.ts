import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Substitua pelo IP do seu computador
// Para Android emulador: http://10.0.2.2:3333/api
// Para iOS emulador: http://localhost:3333/api
// Para dispositivo físico: http://SEU_IP:3333/api
const DEFAULT_BASE_URL = 'http://192.168.1.69:3333/api';

// Função para obter a URL base correta
const getBaseUrl = () => {
  if (__DEV__) {
    // Desenvolvimento
    if (Platform.OS === 'android') {
      // Android emulador
      return 'http://10.0.2.2:3333/api';
    } else if (Platform.OS === 'ios') {
      // iOS emulador
      return 'http://localhost:3333/api';
    }
  }
  // Dispositivo físico ou produção
  return DEFAULT_BASE_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@BeautyClinic:token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (__DEV__) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, fazer logout
      await AsyncStorage.multiRemove(['@BeautyClinic:token', '@BeautyClinic:user']);
      delete api.defaults.headers.common.Authorization;
    }
    
    if (__DEV__) {
      console.error(`❌ ${error.response?.status} ${error.config?.url}:`, error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// ==================== MÉTODOS DE AUTENTICAÇÃO ====================

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  profileImage?: string;
}) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['@BeautyClinic:token', '@BeautyClinic:user']);
  delete api.defaults.headers.common.Authorization;
};

// ==================== MÉTODOS DE PERFIL ====================

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const updateProfileImage = async (imageUri: string) => {
  const response = await api.post('/auth/profile/photo', { photo: imageUri });
  return response.data;
};

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.patch('/auth/profile/password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/auth/profile');
  return response.data;
};

// ==================== MÉTODOS DE SERVIÇOS ====================

export const getServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const getServiceById = async (id: number) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const getServicesByCategory = async (category: string) => {
  const response = await api.get(`/services/category/${category}`);
  return response.data;
};

// ==================== MÉTODOS DE AGENDAMENTOS ====================

// Listar meus agendamentos
export const getMyAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

// Listar todos os agendamentos (admin)
export const getAllAppointments = async () => {
  const response = await api.get('/admin/appointments');
  return response.data;
};

// Obter estatísticas de agendamentos (admin)
export const getAppointmentStats = async () => {
  const response = await api.get('/admin/appointments/stats');
  return response.data;
};

// Obter horários disponíveis para uma data
export const getAvailableSlots = async (date: string) => {
  const response = await api.get(`/available-slots/${date}`);
  return response.data;
};

// Criar novo agendamento
export const createAppointment = async (data: {
  serviceId?: number;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  notes?: string;
}) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

// Obter detalhes de um agendamento específico
export const getAppointmentById = async (id: number) => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

// Cancelar agendamento
export const cancelAppointment = async (id: number) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};

// Reagendar (alterar data/hora)
export const rescheduleAppointment = async (id: number, date: string, time: string) => {
  const response = await api.patch(`/appointments/${id}`, { date, time });
  return response.data;
};

// ==================== MÉTODOS ADMIN (USUÁRIOS) ====================

export const getAllUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const updateUserRole = async (userId: number, role: string) => {
  const response = await api.patch(`/auth/users/${userId}/role`, { role });
  return response.data;
};

// ==================== UTILITÁRIOS ====================

export const updateBaseUrl = (newUrl: string) => {
  api.defaults.baseURL = newUrl;
  console.log(`📡 Base URL atualizada para: ${newUrl}`);
};

export const getCurrentBaseUrl = () => {
  return api.defaults.baseURL;
};

export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro de conexão:', error);
    return { success: false, error: 'Não foi possível conectar ao servidor' };
  }
};

export default api;