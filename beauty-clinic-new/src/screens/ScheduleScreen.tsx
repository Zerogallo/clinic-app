import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// URL da API - ajuste conforme seu IP
const API_URL = 'http://192.168.1.69:3333/api';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface AvailableSlot {
  date: string;
  availableSlots: string[];
  allSlots: string[];
  bookedSlots: string[];
  availableCount: number;
}

export const ScheduleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Receber parâmetros da navegação (vindo do ProductDetailScreen)
  const params = route.params as any;
  const preSelectedService = params?.selectedService || null;
  
  const [selectedService, setSelectedService] = useState<Service | null>(preSelectedService);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Gerar próximos 30 dias
  const generateNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        dateString: date.toISOString().split('T')[0],
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        formatted: date.toLocaleDateString('pt-BR'),
      });
    }
    return days;
  };

  const nextDays = generateNextDays();

  // Horários disponíveis padrão
  const ALL_TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Dados mock para quando a API não estiver disponível
  const MOCK_SERVICES: Service[] = [
    { id: 1, name: 'Remoção de Tatuagem - Laser O Switcher', price: 299.90, duration: 60, description: 'Tecnologia avançada para remoção de tatuagens' },
    { id: 2, name: 'Despigmentação de Sobrancelhas', price: 199.90, duration: 45, description: 'Remoção de micropigmentação a laser' },
    { id: 3, name: 'Micropigmentação de Sobrancelhas', price: 399.90, duration: 90, description: 'Técnicas que elevam sua autoestima' },
    { id: 4, name: 'Revitalização Labial', price: 349.90, duration: 60, description: 'Realce da cor natural dos lábios' },
    { id: 5, name: 'Reconstrução de Sobrancelhas', price: 249.90, duration: 60, description: 'Protocolo Fort Brow' },
    { id: 6, name: 'Clareamento Íntimo', price: 299.90, duration: 45, description: 'Uniformiza e ilumina a pele' },
    { id: 7, name: 'Depilação a Laser', price: 149.90, duration: 30, description: 'Remoção definitiva' },
    { id: 8, name: 'Facial Rejuvenescimento', price: 199.90, duration: 50, description: 'Limpeza facial profunda' },
    { id: 9, name: 'Brow Lamination', price: 179.90, duration: 45, description: 'Designer de sobrancelhas' },
  ];

  useEffect(() => {
    loadUserToken();
    fetchServices();
  }, []);

  const loadUserToken = async () => {
    try {
      const token = await AsyncStorage.getItem('@BeautyClinic:token');
      setUserToken(token);
      console.log('Token carregado:', token ? 'Sim' : 'Não');
    } catch (error) {
      console.error('Erro ao carregar token:', error);
    }
  };

  const fetchServices = async () => {
    try {
      console.log('Buscando serviços...');
      const response = await fetch(`${API_URL}/services`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setServices(data);
        console.log('Serviços carregados da API:', data.length);
      } else {
        setServices(MOCK_SERVICES);
        console.log('Usando serviços mock');
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setServices(MOCK_SERVICES);
    }
  };

  const fetchAvailableTimes = async (date: string) => {
    try {
      console.log(`Buscando horários para: ${date}`);
      const response = await fetch(`${API_URL}/available-slots/${date}`);
      const data = await response.json();
      
      if (data.success && data.data?.availableSlots) {
        setAvailableTimes(data.data.availableSlots);
        console.log('Horários disponíveis:', data.data.availableSlots);
      } else {
        setAvailableTimes(ALL_TIME_SLOTS);
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      setAvailableTimes(ALL_TIME_SLOTS);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTime('');
    setShowServicesModal(false);
  };

  const handleSelectDate = (date: any) => {
    setSelectedDate(date.dateString);
    setSelectedTime('');
    fetchAvailableTimes(date.dateString);
    setShowDateModal(false);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setShowTimeModal(false);
  };

  const handleBooking = async () => {
    // Validações
    if (!selectedService) {
      Alert.alert('Atenção', 'Por favor, selecione um serviço');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Atenção', 'Por favor, selecione uma data');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Atenção', 'Por favor, selecione um horário');
      return;
    }

    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('@BeautyClinic:token');
      
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para agendar');
        setLoading(false);
        return;
      }

      const appointmentData = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
        date: selectedDate,
        time: selectedTime,
        notes: ''
      };

      console.log('Enviando agendamento:', appointmentData);
      console.log('Token:', token);

      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (response.ok && data.success) {
        Toast.show({
          type: 'success',
          text1: '✅ Agendamento Confirmado!',
          text2: `Serviço: ${selectedService.name}\nData: ${new Date(selectedDate).toLocaleDateString('pt-BR')} às ${selectedTime}`,
          position: 'bottom',
          visibilityTime: 5000,
        });

        // Resetar formulário
        setSelectedService(null);
        setSelectedDate('');
        setSelectedTime('');
        
        // Voltar para a tela inicial após 2 segundos
        setTimeout(() => {
          navigation.navigate('Home' as never);
        }, 2000);
      } else {
        Alert.alert('Erro', data.error || 'Erro ao realizar agendamento');
      }
      
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    Alert.alert(
      'Limpar seleção',
      'Deseja realmente limpar todas as seleções?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          onPress: () => {
            setSelectedService(null);
            setSelectedDate('');
            setSelectedTime('');
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="calendar" size={50} color="#764ba2" />
        <Text style={styles.title}>Agendar Serviço</Text>
        <Text style={styles.subtitle}>Escolha o serviço, data e horário</Text>
      </View>

      {/* Passo 1: Serviço */}
      <View style={styles.card}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Escolha o serviço</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.selectorButton}
          onPress={() => setShowServicesModal(true)}
        >
          <Ionicons name="cut-outline" size={24} color="#764ba2" />
          <Text style={styles.selectorText}>
            {selectedService ? selectedService.name : 'Selecione um serviço'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#764ba2" />
        </TouchableOpacity>
        
        {selectedService && (
          <View style={styles.serviceDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={18} color="#764ba2" />
              <Text style={styles.detailText}>R$ {selectedService.price.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color="#764ba2" />
              <Text style={styles.detailText}>{selectedService.duration} minutos</Text>
            </View>
          </View>
        )}
      </View>

      {/* Passo 2: Data - Só aparece se serviço estiver selecionado */}
      {selectedService && (
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Escolha a data</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowDateModal(true)}
          >
            <Ionicons name="calendar-outline" size={24} color="#764ba2" />
            <Text style={styles.selectorText}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : 'Selecione uma data'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#764ba2" />
          </TouchableOpacity>
        </View>
      )}

      {/* Passo 3: Horário - Só aparece se data estiver selecionada */}
      {selectedDate && (
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Escolha o horário</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowTimeModal(true)}
          >
            <Ionicons name="time-outline" size={24} color="#764ba2" />
            <Text style={styles.selectorText}>
              {selectedTime || 'Selecione um horário'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#764ba2" />
          </TouchableOpacity>
        </View>
      )}

      {/* Botão Confirmar - Só aparece quando tudo estiver selecionado */}
      {selectedService && selectedDate && selectedTime && (
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Botão Reset - Só aparece quando algo está selecionado */}
      {selectedService && (
        <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
          <Ionicons name="refresh-outline" size={20} color="#999" />
          <Text style={styles.resetButtonText}>Limpar seleção</Text>
        </TouchableOpacity>
      )}

      {/* Modal de Serviços */}
      <Modal
        visible={showServicesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowServicesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Serviços Disponíveis</Text>
              <TouchableOpacity onPress={() => setShowServicesModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.modalItem,
                    selectedService?.id === service.id && styles.modalItemSelected
                  ]}
                  onPress={() => handleSelectService(service)}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={[
                      styles.modalItemTitle,
                      selectedService?.id === service.id && styles.modalItemTextSelected
                    ]}>
                      {service.name}
                    </Text>
                    <Text style={styles.modalItemPrice}>
                      R$ {service.price.toFixed(2)}
                    </Text>
                  </View>
                  {selectedService?.id === service.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#764ba2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Datas */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma Data</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {nextDays.map((day) => (
                <TouchableOpacity
                  key={day.dateString}
                  style={[
                    styles.modalItem,
                    selectedDate === day.dateString && styles.modalItemSelected
                  ]}
                  onPress={() => handleSelectDate(day)}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={[
                      styles.modalItemTitle,
                      selectedDate === day.dateString && styles.modalItemTextSelected
                    ]}>
                      {day.formatted}
                    </Text>
                    <Text style={styles.modalItemSubtitle}>{day.weekday}</Text>
                  </View>
                  {selectedDate === day.dateString && (
                    <Ionicons name="checkmark-circle" size={24} color="#764ba2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Horários */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um Horário</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.timesGrid}>
              {availableTimes.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    selectedTime === time && styles.timeButtonSelected
                  ]}
                  onPress={() => handleSelectTime(time)}
                >
                  <Text style={[
                    styles.timeButtonText,
                    selectedTime === time && styles.timeButtonTextSelected
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#764ba2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  serviceDetails: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f0e6ff',
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#764ba2',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    padding: 10,
  },
  resetButtonText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemSelected: {
    backgroundColor: '#f0e6ff',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  modalItemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalItemPrice: {
    fontSize: 14,
    color: '#764ba2',
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalItemTextSelected: {
    color: '#764ba2',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  timeButton: {
    width: '30%',
    margin: '1.5%',
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: '#764ba2',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeButtonTextSelected: {
    color: '#fff',
  },
});