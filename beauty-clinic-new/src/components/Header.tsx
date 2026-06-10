import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Header({ title, showBack = false, showLogout = false, onLogout }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title || 'Beauty Clinic'}</Text>
      </View>

      <View style={styles.rightContainer}>
        {showLogout && onLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.iconButton}>
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#9b59b6',
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: { width: 40 },
  centerContainer: { flex: 1, alignItems: 'center' },
  rightContainer: { width: 40, alignItems: 'flex-end' },
  iconButton: { padding: 4 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});