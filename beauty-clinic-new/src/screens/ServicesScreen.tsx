import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Service } from '../types';

const servicesData: Service[] = [
  { id: 1, title: 'Remoção de Tatuagem', description: 'Tecnologia avançada para remover sua tatuagem', duration: 30, price: 200, category: 'tatuagem', icon: 'brush', color: '#9b59b6' },
  { id: 2, title: 'Micropigmentação', description: 'Harmonia e naturalidade', duration: 120, price: 450, category: 'sobrancelhas', icon: 'face', color: '#E91E63' },
  { id: 3, title: 'Depilação a Laser', description: 'Resultados duradouros', duration: 30, price: 150, category: 'depilacao', icon: 'spa', color: '#4CAF50' },
  { id: 4, title: 'Revitalização Labial', description: 'Cor e volume naturais', duration: 90, price: 350, category: 'labios', icon: 'favorite', color: '#FF9800' },
];

export default function ServicesScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = servicesData.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchText && !s.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" />
        <TextInput style={styles.searchInput} placeholder="Buscar serviço..." value={searchText} onChangeText={setSearchText} placeholderTextColor="#999" />
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.serviceCard}>
            <View style={[styles.serviceIcon, { backgroundColor: item.color + '20' }]}>
              <Icon name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{item.title}</Text>
              <Text style={styles.serviceDesc}>{item.description}</Text>
              <Text style={styles.servicePrice}>R$ {item.price}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 15, marginTop: 15, paddingHorizontal: 15, borderRadius: 25, elevation: 2 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, marginLeft: 10, color: '#333' },
  listContent: { paddingBottom: 20 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 15, marginVertical: 8, padding: 15, borderRadius: 12, elevation: 2 },
  serviceIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  serviceDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  servicePrice: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50', marginTop: 4 },
});