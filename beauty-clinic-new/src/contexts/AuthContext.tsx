import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { User, RegisterData } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Resposta do login:', response.data);
      
      // O backend retorna os dados dentro de 'data'
      const responseData = response.data;
      const token = responseData.token || responseData.data?.token;
      const userData = responseData.user || responseData.data?.user;
      
      console.log('Token extraído:', token);
      console.log('UserData extraído:', userData);
      
      if (token && userData) {
        await AsyncStorage.setItem('@BeautyClinic:token', token);
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        console.error('Token ou usuário não encontrado:', { token, userData });
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Email ou senha inválidos';
      return { success: false, error: message };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      console.log('Resposta do registro:', response.data);
      
      // O backend retorna os dados dentro de 'data'
      const responseData = response.data;
      const token = responseData.token || responseData.data?.token;
      const userData = responseData.user || responseData.data?.user;
      
      console.log('Token extraído:', token);
      console.log('UserData extraído:', userData);
      
      if (token && userData) {
        await AsyncStorage.setItem('@BeautyClinic:token', token);
        await AsyncStorage.setItem('@BeautyClinic:user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        console.error('Token ou usuário não encontrado:', { token, userData });
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao cadastrar';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@BeautyClinic:token');
      await AsyncStorage.removeItem('@BeautyClinic:user');
    } catch (error) {
      console.error('Erro ao remover dados:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}