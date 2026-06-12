import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import api from '../services/api';
import { User, RegisterData } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateProfileImage: (imageUri: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const token = await AsyncStorage.getItem('@BeautyClinic:token');
      const userData = await AsyncStorage.getItem('@BeautyClinic:user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.Authorization = `Bearer ${token}`;
        console.log('Usuário carregado:', parsedUser.name);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando login:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Resposta do login:', response.data);
      
      const responseData = response.data;
      const token = responseData.token || responseData.data?.token;
      const userData = responseData.user || responseData.data?.user;
      
      if (token && userData) {
        await AsyncStorage.setItem('@BeautyClinic:token', token);
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(userData));
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Email ou senha inválidos';
      return { success: false, error: message };
    }
  };

  const signIn = login;

  const register = async (data: RegisterData) => {
    try {
      console.log('Tentando registrar:', data.email);
      const response = await api.post('/auth/register', data);
      console.log('Resposta do registro:', response.data);
      
      const responseData = response.data;
      const token = responseData.token || responseData.data?.token;
      const userData = responseData.user || responseData.data?.user;
      
      if (token && userData) {
        await AsyncStorage.setItem('@BeautyClinic:token', token);
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(userData));
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao cadastrar';
      return { success: false, error: message };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', data);
      console.log('Resposta updateProfile:', response.data);
      
      const userData = response.data.user || response.data.data?.user;
      if (userData) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, error: 'Erro ao atualizar perfil' };
    } catch (error: any) {
      console.error('Erro updateProfile:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao atualizar perfil' };
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    try {
      console.log('Atualizando foto de perfil...');
      
      // Converter imagem para base64
      let base64Image = imageUri;
      if (imageUri.startsWith('file://')) {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        base64Image = `data:image/jpeg;base64,${base64}`;
      }
      
      // Enviar para o backend
      const response = await api.post('/auth/profile/photo', { photo: base64Image });
      console.log('Resposta updateProfileImage:', response.data);
      
      const userData = response.data.user || response.data.data?.user;
      if (userData) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, error: 'Erro ao atualizar foto' };
    } catch (error: any) {
      console.error('Erro updateProfileImage:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao atualizar foto' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.patch('/auth/profile/password', { currentPassword, newPassword });
      return response.data;
    } catch (error: any) {
      console.error('Erro updatePassword:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao atualizar senha' };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await api.delete('/auth/profile');
      if (response.data.success) {
        await logout();
        return { success: true };
      }
      return { success: false, error: 'Erro ao deletar conta' };
    } catch (error: any) {
      console.error('Erro deleteAccount:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao deletar conta' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['@BeautyClinic:token', '@BeautyClinic:user']);
      delete api.defaults.headers.Authorization;
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, register, login, signIn, logout,
      updateProfile, updateProfileImage, updatePassword, deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}