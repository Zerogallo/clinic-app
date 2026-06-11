export interface Product {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  materials: string[];
  duration: number;
  category: string;
  isFavorite?: boolean;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt?: string;
  favorites?: number[];
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  category?: string;
}

export interface Appointment {
  id: string;
  userId: string | number;
  date: string;
  time: string;
  serviceId: number;
  serviceName: string;
  price: number;
  status: string;
  createdAt: string;
}