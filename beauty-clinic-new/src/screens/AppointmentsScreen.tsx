import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// URL da API - ajuste conforme seu IP
const API_URL = 'http://192.168.1.69:3333/api';

interface Appointment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceId: number;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  notes: string;
  status: string;
  createdAt: string;
  cancelledAt?: string;
}

export const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Carregar token ao montar
  useEffect(() => {
    loadToken();
  }, []);

  // Recarregar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      if (userToken) {
        fetchAppointments();
      }
    }, [userToken])
  );

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem('@BeautyClinic:token');
      console.log('Token carregado:', token ? 'Sim' : 'Não');
      setUserToken(token);
      if (token) {
        await fetchAppointments();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao carregar token:', error);
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('@BeautyClinic:token');
      
      if (!token) {
        console.log('Sem token, não é possível buscar agendamentos');
        setLoading(false);
        return;
      }

      console.log('Buscando agendamentos...');
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Resposta da API:', data);

      if (response.ok && data.success) {
        setAppointments(data.appointments || []);
        console.log(`${data.appointments?.length || 0} agendamentos encontrados`);
      } else {
        console.error('Erro ao buscar agendamentos:', data.error);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const cancelAppointment = async (appointment: Appointment) => {
    Alert.alert(
      'Cancelar Agendamento',
      `Deseja realmente cancelar o agendamento de ${appointment.serviceName} do dia ${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.time}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('@BeautyClinic:token');
              
              const response = await fetch(`${API_URL}/appointments/${appointment.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });

              const data = await response.json();

              if (response.ok && data.success) {
                Toast.show({
                  type: 'success',
                  text1: '✅ Agendamento Cancelado!',
                  text2: 'Seu agendamento foi cancelado com sucesso',
                  position: 'bottom',
                });
                fetchAppointments();
              } else {
                Alert.alert('Erro', data.error || 'Não foi possível cancelar');
              }
            } catch (error) {
              console.error('Erro ao cancelar:', error);
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#ff9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceIcon}>
          <Ionicons name="calendar" size={24} color="#764ba2" />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        {item.status === 'confirmed' && (
          <TouchableOpacity onPress={() => cancelAppointment(item)}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={18} color="#666" />
          <Text style={styles.detailText}>{formatPrice(item.price)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="mail-outline" size={14} color="#4caf50" />
        <Text style={styles.confirmationText}>
          Confirmação enviada por email
        </Text>
      </View>
    </View>
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
      <Text style={styles.emptySubtext}>
        Você ainda não tem nenhum agendamento. 
        Acesse a aba "Agendar" e reserve seu horário!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#764ba2" />
        <Text style={styles.loadingText}>Carregando agendamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list-circle-outline" size={40} color="#fff" />
        <Text style={styles.title}>Meus Agendamentos</Text>
        <Text style={styles.subtitle}>
          {appointments.length} {appointments.length === 1 ? 'agendamento encontrado' : 'agendamentos encontrados'}
        </Text>
      </View>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: '#764ba2',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmationText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4caf50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});