import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.profileName}>{user?.name || 'Cliente'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'cliente@email.com'}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="person" size={22} color="#9b59b6" />
          <Text style={styles.menuText}>Meus Dados</Text>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="event" size={22} color="#4CAF50" />
          <Text style={styles.menuText}>Meus Agendamentos</Text>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="info" size={22} color="#2196F3" />
          <Text style={styles.menuText}>Sobre a Clínica</Text>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#F44336" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Beauty Clinic v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileHeader: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 30, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 2 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#9b59b6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  profileEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  menuSection: { backgroundColor: '#fff', marginHorizontal: 15, marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuText: { flex: 1, fontSize: 15, color: '#333', marginLeft: 15 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginHorizontal: 15, marginTop: 20, paddingVertical: 15, borderRadius: 12 },
  logoutText: { fontSize: 16, color: '#F44336', fontWeight: '500', marginLeft: 8 },
  versionText: { textAlign: 'center', fontSize: 12, color: '#999', marginTop: 20, marginBottom: 30 },
});