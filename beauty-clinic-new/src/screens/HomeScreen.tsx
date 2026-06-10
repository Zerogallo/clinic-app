import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const services = [
  {
    id: 1,
    title: "Despigmentação de sobrancelhas",
    description: "Remoção de micropigmentação a laser e química, para despigmentar as sobrancelhas de forma saudáveis e segura. Protocolo personalizados com resultados garantidos.",
    icon: "brush-outline"
  },
  {
    id: 2,
    title: "Remoção de tatuagem",
    description: "Tecnologia avançada para remover sua tatuagem com segurança e técnica.",
    icon: "flash-outline"
  },
  {
    id: 3,
    title: "Micropigmentação de sobrancelhas",
    description: "Técnicas que elevam sua autoestima, trazendo naturalidade, destaque e harmonia ao olhar.",
    icon: "eye-outline"
  },
  {
    id: 4,
    title: "Revitalização labial",
    description: "Uma técnica de pigmentação suave que realça a cor natural dos lábios, corrige pequenas assimetrias e devolve o aspecto saudável e delicado aos lábios",
    icon: "heart-outline"
  },
  {
    id: 5,
    title: "Designer e reconstrução de sobrancelhas",
    description: "Fort Brow é um protocolo avançado de reconstrução de sobrancelhas criados para recuperar fios, fortalece a estrutura da sobrancelha e devolve volume onde existe falha ou fragilidade.",
    icon: "build-outline"
  },
  {
    id: 6,
    title: "Clareamento íntimo",
    description: "Protocolo seguros para uniformizar e iluminar a pele das regiões escurecidas, como axila, virilha ou manchas.",
    icon: "leaf-outline"
  },
  {
    id: 7,
    title: "Depilação laser",
    description: "Conforto, eficiência e resultados duradouros.",
    icon: "cut-outline"
  },
  {
    id: 8,
    title: "Facial",
    description: "Limpeza facial protocolo de rejuvenescimento.",
    icon: "happy-outline"
  },
  {
    id: 9,
    title: "Brow lamination",
    description: "Realinha e disciplina os fios das sobrancelhas, deixando os mais alinhados, preenchidos e com aparência de sobrancelha mais cheia e definida.",
    icon: "water-outline"
  }
];

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logo}>
            <Ionicons name="sparkles" size={32} color="#fff" />
            <Text style={styles.logoText}>Beauty Clinic</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Bem-vindo(a), {user?.name?.split(' ')[0]}!</Text>
        <Text style={styles.tagline}>Especialistas em Remoção de Tatuagens</Text>
      </View>

      {/* Laser Highlight */}
      <View style={styles.laserHighlight}>
        <View style={styles.laserIcon}>
          <Ionicons name="flash" size={50} color="#FFD700" />
        </View>
        <Text style={styles.laserTitle}>Tecnologia de Ponta</Text>
        <Text style={styles.laserName}>⚡ Laser O Switcher ⚡</Text>
        <Text style={styles.laserDesc}>
          Tecnologia avançada para remoção segura, eficaz e sem cicatrizes.
          Resultados visíveis desde a primeira sessão!
        </Text>
        <View style={styles.laserFeatures}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Sem dor</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Sem cicatriz</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Resultado rápido</Text>
          </View>
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>💅 Nossos Serviços</Text>
        
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Ionicons name={service.icon as any} size={40} color="#764ba2" />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDesc}>{service.description}</Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => navigation.navigate('Schedule' as never)}
              >
                <Text style={styles.bookButtonText}>Agendar</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#764ba2',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  laserHighlight: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  laserIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  laserTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  laserName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#764ba2',
    marginVertical: 5,
  },
  laserDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  laserFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  servicesSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    marginRight: 15,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  serviceDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#764ba2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});