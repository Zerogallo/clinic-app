import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Email ou senha inválidos');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Icon name="spa" size={50} color="#9b59b6" />
        </View>
        <Text style={styles.appName}>Beauty Clinic</Text>
        <Text style={styles.tagline}>Especialista em remoção de tatuagens</Text>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#9b59b6" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#9b59b6" />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>
          Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#9b59b6' },
  tagline: { fontSize: 14, color: '#666', marginTop: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, backgroundColor: '#f9f9f9' },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, marginLeft: 10, color: '#333' },
  loginButton: { backgroundColor: '#9b59b6', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  registerText: { textAlign: 'center', marginTop: 20, color: '#666' },
  registerLink: { color: '#9b59b6', fontWeight: 'bold' },
});