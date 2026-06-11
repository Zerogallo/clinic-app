import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Product {
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

export const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { product } = route.params as { product: Product };
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aqui você pode salvar no AsyncStorage
  };

  const handleSchedule = () => {
    if (!user) {
      Alert.alert('Atenção', 'Faça login para agendar');
      navigation.navigate('Login' as never);
      return;
    }
    navigation.navigate('Schedule' as never);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={20} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half-star" name="star-half" size={20} color="#FFD700" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={20} color="#FFD700" />);
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={28} 
            color={isFavorite ? '#ff4444' : '#fff'} 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.subtitle}>{product.subtitle}</Text>

        {/* Rating */}
        <View style={styles.ratingSection}>
          <View style={styles.starsContainer}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.ratingValue}>{product.rating}</Text>
          <Text style={styles.reviewsCount}>({product.reviews} avaliações)</Text>
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Materiais Utilizados</Text>
          <View style={styles.materialsGrid}>
            {product.materials.map((material, index) => (
              <View key={index} style={styles.materialItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} color="#764ba2" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Duração do Procedimento</Text>
              <Text style={styles.infoValue}>{product.duration} minutos</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Sobre o Procedimento</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Price and Schedule */}
        <View style={styles.bottomSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Valor do Procedimento</Text>
            <Text style={styles.priceValue}>R$ {product.price.toFixed(2)}</Text>
            <Text style={styles.installmentText}>
              ou em até 3x de R$ {(product.price / 3).toFixed(2)} sem juros
            </Text>
          </View>

          <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
            <Ionicons name="calendar" size={24} color="#fff" />
            <Text style={styles.scheduleButtonText}>Agendar Agora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#764ba2',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  reviewsCount: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    margin: '1%',
    marginBottom: 10,
  },
  materialText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#f0e6ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#764ba2',
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  bottomSection: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceContainer: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#764ba2',
    marginTop: 5,
  },
  installmentText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  scheduleButton: {
    backgroundColor: '#764ba2',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});