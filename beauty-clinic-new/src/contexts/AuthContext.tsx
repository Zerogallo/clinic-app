import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import api from '../services/api';

interface User {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  profileImage?: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  profileImage?: string | null;
}

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
      
      if (response.data.success && response.data.token && response.data.user) {
        await AsyncStorage.setItem('@BeautyClinic:token', response.data.token);
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(response.data.user));
        api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'Erro ao fazer login' };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      const message = error.response?.data?.error || 'Email ou senha inválidos';
      return { success: false, error: message };
    }
  };

  const signIn = login;

  const register = async (data: RegisterData) => {
    try {
      console.log('Tentando registrar:', data.email);
      const response = await api.post('/auth/register', data);
      console.log('Resposta do registro:', response.data);
      
      if (response.data.success && response.data.token && response.data.user) {
        await AsyncStorage.setItem('@BeautyClinic:token', response.data.token);
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(response.data.user));
        api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'Erro ao cadastrar' };
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const message = error.response?.data?.error || 'Erro ao cadastrar';
      return { success: false, error: message };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      console.log('Atualizando perfil...', data);
      const response = await api.put('/auth/profile', data);
      console.log('Resposta da atualização:', response.data);
      
      if (response.data.success && response.data.user) {
        const updatedUser = { ...user, ...response.data.user };
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Erro ao atualizar perfil' };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
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
      
      // Tentar POST primeiro
      const response = await api.post('/auth/profile/photo', { 
        photo: base64Image 
      });
      
      console.log('Resposta da atualização de foto:', response.data);
      
      if (response.data.success && response.data.user) {
        const updatedUser = { ...user, ...response.data.user };
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Erro ao atualizar foto' };
      
    } catch (error: any) {
      console.error('Erro ao atualizar foto:', error);
      
      // Tentar PUT como fallback
      try {
        let base64Image = imageUri;
        if (imageUri.startsWith('file://')) {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          base64Image = `data:image/jpeg;base64,${base64}`;
        }
        
        const response = await api.put('/auth/profile/photo', { 
          photo: base64Image 
        });
        
        if (response.data.success && response.data.user) {
          const updatedUser = { ...user, ...response.data.user };
          await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          return { success: true };
        }
      } catch (putError: any) {
        console.error('Erro no fallback PUT:', putError);
      }
      
      return { success: false, error: error.response?.data?.error || 'Erro ao atualizar foto' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      console.log('Atualizando senha...');
      const response = await api.patch('/auth/profile/password', {
        currentPassword,
        newPassword
      });
      
      console.log('Resposta da atualização de senha:', response.data);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Erro ao atualizar senha' };
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao atualizar senha' };
    }
  };

  const deleteAccount = async () => {
    try {
      console.log('Deletando conta...');
      const response = await api.delete('/auth/profile');
      console.log('Resposta da deleção:', response.data);
      
      if (response.data.success) {
        await logout();
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Erro ao deletar conta' };
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      return { success: false, error: error.response?.data?.error || 'Erro ao deletar conta' };
    }
  };

  const logout = async () => {
    try {
      console.log('Iniciando logout...');
      await AsyncStorage.multiRemove(['@BeautyClinic:token', '@BeautyClinic:user']);
      delete api.defaults.headers.Authorization;
      setUser(null);
      console.log('Logout concluído');
    } catch (error) {
      console.error('Erro no logout:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      signIn, 
      logout,
      updateProfile,
      updateProfileImage,
      updatePassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}