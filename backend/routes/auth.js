const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJSON, writeJSON } = require('../utils/fileHandler');
const { sendWelcomeEmail } = require('../services/emailService');
const { ResponseMessages } = require('../middleware/responseMessages');
const logger = require('../utils/logger');

const router = express.Router();

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    logger.info(`📝 Tentativa de registro: ${email}`);

    // Validações
    if (!name || !email || !password) {
      logger.warning('Campos obrigatórios faltando');
      return res.error('MISSING_FIELDS');
    }

    if (password.length < 6) {
      return res.error('PASSWORD_TOO_SHORT');
    }

    // Verificar se email já existe
    const users = await readJSON('users.json');
    const userExists = users.find(u => u.email === email);
    
    if (userExists) {
      logger.warning(`Tentativa de registro com email existente: ${email}`);
      return res.error('USER_ALREADY_EXISTS');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const newUser = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'client',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeJSON('users.json', users);
    logger.success(`Usuário criado: ${email} (ID: ${newUser.id})`);

    // Enviar email de boas-vindas (não bloqueia o registro)
    sendWelcomeEmail(email, name).catch(err => {
      logger.warning(`Email de boas-vindas não enviado: ${err.message}`);
    });

    // Gerar token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Retornar dados sem a senha
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.success('USER_CREATED', { user: userWithoutPassword, token });

  } catch (error) {
    logger.error('Erro no registro', error);
    res.error('INTERNAL_ERROR', error.message);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`🔐 Tentativa de login: ${email}`);

    if (!email || !password) {
      return res.error('MISSING_FIELDS');
    }

    const users = await readJSON('users.json');
    const user = users.find(u => u.email === email);

    if (!user) {
      logger.warning(`Login falhou - usuário não encontrado: ${email}`);
      return res.error('INVALID_CREDENTIALS');
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      logger.warning(`Login falhou - senha incorreta: ${email}`);
      return res.error('INVALID_CREDENTIALS');
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    logger.success(`Login bem-sucedido: ${email}`);
    res.success('LOGIN_SUCCESS', { user: userWithoutPassword, token });

  } catch (error) {
    logger.error('Erro no login', error);
    res.error('INTERNAL_ERROR', error.message);
  }
});

// Obter perfil do usuário (rota protegida)
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.error('USER_NOT_FOUND');
    }

    const { password: _, ...userWithoutPassword } = user;
    logger.success(`Perfil carregado: ${user.email}`);
    res.success('PROFILE_FETCHED', userWithoutPassword);

  } catch (error) {
    logger.error('Erro ao buscar perfil', error);
    res.error('INTERNAL_ERROR', error.message);
  }
});

module.exports = router;
