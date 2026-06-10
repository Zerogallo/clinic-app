import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { User, RegisterData } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
      
      console.log('Carregando dados do storage...', { hasToken: !!token, hasUser: !!userData });
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.Authorization = `Bearer ${token}`;
        console.log('Usuário carregado:', parsedUser.name);
      } else {
        console.log('Nenhum usuário logado');
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
        console.log('Login bem sucedido:', userData.name);
        return { success: true };
      } else {
        console.error('Token ou usuário não encontrado');
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
        console.log('Registro bem sucedido:', userData.name);
        return { success: true };
      } else {
        console.error('Token ou usuário não encontrado');
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
      console.log('Iniciando logout...');
      console.log('Usuário atual:', user?.name);
      
      // Limpar AsyncStorage
      await AsyncStorage.removeItem('@BeautyClinic:token');
      await AsyncStorage.removeItem('@BeautyClinic:user');
      
      // Limpar header do axios
      delete api.defaults.headers.Authorization;
      
      // Limpar estado do usuário
      setUser(null);
      
      console.log('Logout concluído, usuário:', null);
      
      // Verificar se removeu
      const token = await AsyncStorage.getItem('@BeautyClinic:token');
      const userData = await AsyncStorage.getItem('@BeautyClinic:user');
      console.log('Verificação pós-logout - Token:', !!token, 'User:', !!userData);
      
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, tentar resetar o estado
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}