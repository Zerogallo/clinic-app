# 💄 Beauty Clinic App

Aplicativo mobile completo para gestão da clínica de estética **Beauty Clinic**, especializada em remoção de tatuagens e tratamentos estéticos. Desenvolvido com React Native + TypeScript no frontend e Node.js + Express no backend.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1B1F1F?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)

---

## 📱 Funcionalidades

- 🔐 **Autenticação segura** – Cadastro/login com validação e token JWT
- 👤 **Perfil do usuário** – Edição de dados, troca de senha e upload de foto
- 📅 **Agendamento de serviços** – Calendário interativo com horários disponíveis
- 📧 **Confirmação por e-mail** – Envio automático de confirmação de agendamento
- ⭐ **Favoritos e avaliações** – Sistema de curtidas e avaliação por estrelas
- 📋 **Histórico de agendamentos** – Listagem e cancelamento
- 🖼️ **Upload de imagem** – Foto de perfil com preview e edição
- 📱 **Interface moderna** – Design responsivo com ícones e gradientes

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/) (Stack + Bottom Tabs)
- [Axios](https://axios-http.com/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Native Toast Message](https://github.com/calintamas/react-native-toast-message)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

### Backend
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [JWT](https://jwt.io/) para autenticação
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) para hash de senhas
- [Nodemailer](https://nodemailer.com/) para envio de e-mails
- Persistência em arquivos JSON (modular e simples)

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Expo CLI (para frontend)
- Emulador Android/iOS ou dispositivo físico

### Backend

```bash
cd backend
npm install
npm run dev
```
### Frontend

```
cd frontend
npm install
npx expo start
```
