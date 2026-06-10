export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin';
  createdAt: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  icon: string;
  color: string;
}

export interface Appointment {
  id: number;
  userId: number;
  serviceId: number;
  serviceName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}
