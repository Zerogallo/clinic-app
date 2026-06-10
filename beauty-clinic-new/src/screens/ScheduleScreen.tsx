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
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';

// Dados mock para quando a API não estiver disponível
const MOCK_SERVICES = [
  { id: 1, name: 'Remoção de Tatuagem - Laser O Switcher', price: 299.90, duration: 60, description: 'Tecnologia avançada' },
  { id: 2, name: 'Despigmentação de Sobrancelhas', price: 199.90, duration: 45, description: 'Remoção a laser' },
  { id: 3, name: 'Micropigmentação de Sobrancelhas', price: 399.90, duration: 90, description: 'Técnicas avançadas' },
  { id: 4, name: 'Revitalização Labial', price: 349.90, duration: 60, description: 'Realce da cor natural' },
  { id: 5, name: 'Reconstrução de Sobrancelhas', price: 249.90, duration: 60, description: 'Protocolo Fort Brow' },
];

const MOCK_TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export const ScheduleScreen = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [services, setServices] = useState(MOCK_SERVICES);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState('');
  
  // Gerar próximas datas
  const getNextDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const formatted = date.toLocaleDateString('pt-BR');
      const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      dates.push({ dateString, formatted, weekday });
    }
    return dates;
  };

  const nextDates = getNextDates();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      if (response.data && response.data.length > 0) {
        setServices(response.data);
      }
    } catch (error) {
      console.log('Usando serviços mock');
      // Já estamos usando MOCK_SERVICES como fallback
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setModalVisible('');
  };

  const handleDateSelect = (date: any) => {
    setSelectedDate(date.dateString);
    setModalVisible('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setModalVisible('');
  };

  const handleBooking = async () => {
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
      await api.post('/appointments', {
        date: selectedDate,
        time: selectedTime,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
      });

      Toast.show({
        type: 'success',
        text1: '✅ Agendamento Confirmado!',
        text2: 'Enviamos os detalhes para seu email',
        position: 'bottom',
      });

      // Resetar formulário
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao agendar');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
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
          onPress={() => setModalVisible('service')}
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

      {/* Passo 2: Data */}
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
            onPress={() => setModalVisible('date')}
          >
            <Ionicons name="calendar-outline" size={24} color="#764ba2" />
            <Text style={styles.selectorText}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : 'Selecione uma data'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#764ba2" />
          </TouchableOpacity>
        </View>
      )}

      {/* Passo 3: Horário */}
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
            onPress={() => setModalVisible('time')}
          >
            <Ionicons name="time-outline" size={24} color="#764ba2" />
            <Text style={styles.selectorText}>
              {selectedTime || 'Selecione um horário'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#764ba2" />
          </TouchableOpacity>
        </View>
      )}

      {/* Botão Confirmar */}
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

      {/* Modal de Serviços */}
      <Modal
        visible={modalVisible === 'service'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible('')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Serviços Disponíveis</Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.modalItem}
                  onPress={() => handleServiceSelect(service)}
                >
                  <View>
                    <Text style={styles.modalItemTitle}>{service.name}</Text>
                    <Text style={styles.modalItemPrice}>R$ {service.price.toFixed(2)}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#764ba2" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Datas */}
      <Modal
        visible={modalVisible === 'date'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible('')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma Data</Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {nextDates.map((date) => (
                <TouchableOpacity
                  key={date.dateString}
                  style={[
                    styles.modalItem,
                    selectedDate === date.dateString && styles.modalItemSelected
                  ]}
                  onPress={() => handleDateSelect(date)}
                >
                  <View>
                    <Text style={[
                      styles.modalItemTitle,
                      selectedDate === date.dateString && styles.modalItemTextSelected
                    ]}>
                      {date.formatted}
                    </Text>
                    <Text style={styles.modalItemSubtitle}>{date.weekday}</Text>
                  </View>
                  {selectedDate === date.dateString && (
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
        visible={modalVisible === 'time'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible('')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um Horário</Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.timesGrid}>
              {MOCK_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    selectedTime === time && styles.timeButtonSelected
                  ]}
                  onPress={() => handleTimeSelect(time)}
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

      {/* Botão Reset (opcional) */}
      {selectedService && (
        <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
          <Ionicons name="refresh-outline" size={20} color="#999" />
          <Text style={styles.resetButtonText}>Limpar seleção</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 20,
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
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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