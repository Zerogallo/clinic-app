import api from './api';

export interface Service {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export const serviceApi = {
  async getServices(): Promise<Service[]> {
    try {
      const response = await api.get('/services');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  async getServiceById(id: number): Promise<Service | null> {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return null;
    }
  },
};