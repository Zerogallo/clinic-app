import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const services = [
  { id: 1, title: 'Remoção de Tatuagem', icon: 'brush', color: '#9b59b6', desc: 'Tecnologia avançada' },
  { id: 2, title: 'Micropigmentação', icon: 'face', color: '#E91E63', desc: 'Harmonia e beleza' },
  { id: 3, title: 'Depilação a Laser', icon: 'spa', color: '#4CAF50', desc: 'Resultados duradouros' },
  { id: 4, title: 'Revitalização Labial', icon: 'favorite', color: '#FF9800', desc: 'Cor e volume' },
];

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, 👋</Text>
          <Text style={styles.userName}>{user?.name || 'Cliente'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Icon name="spa" size={30} color="#9b59b6" />
        </View>
      </View>

      <View style={styles.techCard}>
        <Icon name="bolt" size={30} color="#fff" />
        <View style={styles.techContent}>
          <Text style={styles.techTitle}>Laser "O Switcher"</Text>
          <Text style={styles.techDesc}>Tecnologia avançada para remoção de tatuagens</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Nossos Serviços</Text>

      {services.map(service => (
        <TouchableOpacity key={service.id} style={styles.serviceCard}>
          <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
            <Icon name={service.icon} size={28} color={service.color} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDesc}>{service.desc}</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  headerIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center' },
  techCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#9b59b6', margin: 20, padding: 15, borderRadius: 15 },
  techContent: { flex: 1, marginLeft: 15 },
  techTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  techDesc: { fontSize: 12, color: '#f0e6ff', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginTop: 10, marginBottom: 15, color: '#333' },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 10, padding: 15, borderRadius: 12, elevation: 2 },
  serviceIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  serviceDesc: { fontSize: 12, color: '#666', marginTop: 2 },
});