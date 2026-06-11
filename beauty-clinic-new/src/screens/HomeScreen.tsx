import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dados dos produtos/serviços
const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Remoção de Tatuagem",
    subtitle: "Laser O Switcher",
    description: "Tecnologia avançada para remoção de tatuagens indesejadas com segurança e eficácia. Procedimento indolor, sem cicatrizes e com resultados visíveis desde a primeira sessão.",
    price: 299.90,
    image: require("../assets/images/remocao-tatuagem.jpg"),
    rating: 4.8,
    reviews: 127,
    duration: 60,
    materials: [
      "Laser O Switcher de última geração",
      "Óculos de proteção",
      "Gel calmante pós-procedimento",
      "Creme regenerador"
    ],
    category: "remoção"
  },
  {
    id: 2,
    title: "Despigmentação",
    subtitle: "Sobrancelhas",
    description: "Remoção de micropigmentação a laser e química para despigmentar as sobrancelhas de forma saudável e segura. Protocolos personalizados com resultados garantidos.",
    price: 199.90,
    image: require("../assets/images/Despigmentacao.jpg"),
    rating: 4.9,
    reviews: 89,
    duration: 45,
    materials: [
      "Laser específico para pigmentos",
      "Solução removedora química",
      "Hidratante reparador",
      "Protetor solar especial"
    ],
    category: "sobrancelhas"
  },
  {
    id: 3,
    title: "Micropigmentação",
    subtitle: "Sobrancelhas",
    description: "Técnicas avançadas que elevam sua autoestima, trazendo naturalidade, destaque e harmonia ao olhar. Procedimento personalizado conforme seu rosto.",
    price: 399.90,
    image: require("../assets/images/Micropigmentacao.jpg"),
    rating: 4.9,
    reviews: 156,
    duration: 90,
    materials: [
      "Pigmentos importados",
      "Microagulhamento descartável",
      "Anestésico tópico",
      "Creme pós-procedimento"
    ],
    category: "sobrancelhas"
  },
  {
    id: 4,
    title: "Revitalização Labial",
    subtitle: "Harmonização",
    description: "Técnica de pigmentação suave que realça a cor natural dos lábios, corrige pequenas assimetrias e devolve o aspecto saudável e delicado aos lábios.",
    price: 349.90,
    image: require("../assets/images/Revitalizacao-Labial.jpg"),
    rating: 4.7,
    reviews: 94,
    duration: 60,
    materials: [
      "Pigmentos hidratantes",
      "Anestésico labial",
      "Hidratante reparador",
      "Protetor labial"
    ],
    category: "labial"
  },
  {
    id: 5,
    title: "Fort Brow",
    subtitle: "Reconstrução de Sobrancelhas",
    description: "Protocolo avançado de reconstrução de sobrancelhas criado para recuperar fios, fortalecer a estrutura e devolver volume onde existe falha ou fragilidade.",
    price: 249.90,
    image: require("../assets/images/Fort-Brow.webp"),
    rating: 4.8,
    reviews: 67,
    duration: 60,
    materials: [
      "Soro fortificador",
      "Minerais e vitaminas",
      "Escova aplicadora",
      "Manutenção domiciliar"
    ],
    category: "sobrancelhas"
  },
  {
    id: 6,
    title: "Clareamento Íntimo",
    subtitle: "Estética Íntima",
    description: "Protocolos seguros para uniformizar e iluminar a pele das regiões escurecidas, como axila, virilha ou manchas. Resultados naturais e duradouros.",
    price: 299.90,
    image: require("../assets/images/peeling-intimo.jpeg"),
    rating: 4.9,
    reviews: 43,
    duration: 45,
    materials: [
      "Cremes clareadores",
      "Laser de baixa potência",
      "Hidratante íntimo",
      "Protetor solar específico"
    ],
    category: "estética"
  },
  {
    id: 7,
    title: "Depilação a Laser",
    subtitle: "Remoção Definitiva",
    description: "Conforto, eficiência e resultados duradouros. Tecnologia avançada para eliminar os pelos de forma definitiva e indolor.",
    price: 149.90,
    image: require("../assets/images/Depilacao-a-Laser.png"),
    rating: 4.6,
    reviews: 203,
    duration: 30,
    materials: [
      "Laser de diodo",
      "Gel refrigerante",
      "Óculos de proteção",
      "Creme pós-depilação"
    ],
    category: "depilação"
  },
  {
    id: 8,
    title: "Facial Rejuvenescimento",
    subtitle: "Limpeza Profunda",
    description: "Limpeza facial profunda e protocolo de rejuvenescimento que revitaliza sua pele, removendo impurezas e estimulando a produção de colágeno.",
    price: 199.90,
    image: require("../assets/images/Facial-Rejuvenescimento.webp"),
    rating: 4.8,
    reviews: 112,
    duration: 50,
    materials: [
      "Produtos dermocosméticos",
      "Água oxigenada",
      "Extrator de cravos",
      "Máscara revitalizante"
    ],
    category: "facial"
  },
  {
    id: 9,
    title: "Brow Lamination",
    subtitle: "Designer de Sobrancelhas",
    description: "Realinhamento e disciplinamento dos fios das sobrancelhas, deixando-os mais alinhados, preenchidos e com aparência mais cheia e definida.",
    price: 179.90,
    image: require("../assets/images/Brow-Lamination.png"),
    rating: 4.7,
    reviews: 78,
    duration: 45,
    materials: [
      "Produto de laminação",
      "Fixador profissional",
      "Pente modelador",
      "Óleo nutritivo"
    ],
    category: "sobrancelhas"
  }
];

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

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('@BeautyClinic:favorites');
      if (savedFavorites) {
        const favIds = JSON.parse(savedFavorites);
        setFavorites(favIds);
        // Atualizar produtos com favoritos
        setProducts(prev => prev.map(p => ({
          ...p,
          isFavorite: favIds.includes(p.id)
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const toggleFavorite = async (productId: number) => {
    try {
      let newFavorites;
      if (favorites.includes(productId)) {
        newFavorites = favorites.filter(id => id !== productId);
      } else {
        newFavorites = [...favorites, productId];
      }
      
      setFavorites(newFavorites);
      setProducts(prev => prev.map(p => ({
        ...p,
        isFavorite: newFavorites.includes(p.id)
      })));
      
      await AsyncStorage.setItem('@BeautyClinic:favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail' as never, { product: item } as never)}
    >
      <Image source={item.image} style={styles.cardImage} />
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons 
          name={item.isFavorite ? 'heart' : 'heart-outline'} 
          size={24} 
          color={item.isFavorite ? '#ff4444' : '#fff'} 
        />
      </TouchableOpacity>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews} avaliações)</Text>
        </View>
        <Text style={styles.cardPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.welcomeText}>Olá, {user?.name?.split(' ')[0]}! 👋</Text>
        <Text style={styles.tagline}>Descubra os melhores tratamentos para você</Text>
      </View>

      {/* Laser Highlight */}
      <View style={styles.laserHighlight}>
        <View style={styles.laserIcon}>
          <Ionicons name="flash" size={40} color="#FFD700" />
        </View>
        <View style={styles.laserInfo}>
          <Text style={styles.laserTitle}>Tecnologia Exclusiva</Text>
          <Text style={styles.laserName}>⚡ Laser O Switcher</Text>
          <Text style={styles.laserDesc}>Tecnologia avançada para remoção segura e eficaz</Text>
        </View>
      </View>

      {/* Recomendados para você */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Recomendados para você</Text>
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Mais populares */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Mais Populares</Text>
        <FlatList
          data={[...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5)}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
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
    margin: 15,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  laserIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  laserInfo: {
    flex: 1,
  },
  laserTitle: {
    fontSize: 14,
    color: '#666',
  },
  laserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#764ba2',
    marginVertical: 2,
  },
  laserDesc: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  productsList: {
    paddingLeft: 15,
    paddingRight: 5,
  },
  card: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#764ba2',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 12,
    color: '#999',
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#764ba2',
  },
});