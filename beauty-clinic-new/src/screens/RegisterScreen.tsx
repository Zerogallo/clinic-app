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

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, phone, password });
    setLoading(false);

    if (result.success) {
      Alert.alert('Sucesso', 'Cadastro realizado!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível cadastrar');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#9b59b6" />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Icon name="person-add" size={50} color="#9b59b6" />
        </View>
        <Text style={styles.appName}>Criar Conta</Text>
        <Text style={styles.tagline}>Junte-se à Beauty Clinic</Text>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="person" size={20} color="#9b59b6" />
        <TextInput style={styles.input} placeholder="Nome completo *" value={name} onChangeText={setName} placeholderTextColor="#999" />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#9b59b6" />
        <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#9b59b6" />
        <TextInput style={styles.input} placeholder="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#999" />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#9b59b6" />
        <TextInput style={styles.input} placeholder="Senha *" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#9b59b6" />
        <TextInput style={styles.input} placeholder="Confirmar senha *" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholderTextColor="#999" />
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Cadastrar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, padding: 20 },
  backButton: { marginBottom: 20, width: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#9b59b6' },
  tagline: { fontSize: 14, color: '#666', marginTop: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, backgroundColor: '#f9f9f9' },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, marginLeft: 10, color: '#333' },
  registerButton: { backgroundColor: '#9b59b6', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});