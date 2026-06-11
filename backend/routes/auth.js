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
    const { name, email, password, phone, profileImage } = req.body;
    logger.info(`📝 Tentativa de registro: ${email}`);

    if (!name || !email || !password) {
      logger.warning('Campos obrigatórios faltando');
      return res.error('MISSING_FIELDS');
    }

    if (password.length < 6) {
      return res.error('PASSWORD_TOO_SHORT');
    }

    const users = await readJSON('users.json');
    const userExists = users.find(u => u.email === email);
    
    if (userExists) {
      logger.warning(`Tentativa de registro com email existente: ${email}`);
      return res.error('USER_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      profileImage: profileImage || null,
      role: 'client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeJSON('users.json', users);
    logger.success(`Usuário criado: ${email} (ID: ${newUser.id})`);

    sendWelcomeEmail(email, name).catch(err => {
      logger.warning(`Email de boas-vindas não enviado: ${err.message}`);
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(200).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    logger.error('Erro no registro', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`🔐 Tentativa de login: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios' });
    }

    const users = await readJSON('users.json');
    const user = users.find(u => u.email === email);

    if (!user) {
      logger.warning(`Login falhou - usuário não encontrado: ${email}`);
      return res.status(401).json({ success: false, error: 'Email ou senha inválidos' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      logger.warning(`Login falhou - senha incorreta: ${email}`);
      return res.status(401).json({ success: false, error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    logger.success(`Login bem-sucedido: ${email}`);
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    logger.error('Erro no login', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Obter perfil do usuário
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    logger.success(`Perfil carregado: ${user.email}`);
    res.status(200).json({ success: true, user: userWithoutPassword });

  } catch (error) {
    logger.error('Erro ao buscar perfil', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE ATUALIZAÇÃO DE PERFIL ====================

// Atualizar perfil completo
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, email, phone, profileImage } = req.body;
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    if (email && email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === email && u.id !== req.userId);
      if (emailExists) {
        return res.status(400).json({ success: false, error: 'Email já está em uso' });
      }
    }

    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (phone !== undefined) users[userIndex].phone = phone;
    if (profileImage !== undefined) users[userIndex].profileImage = profileImage;

    users[userIndex].updatedAt = new Date().toISOString();

    await writeJSON('users.json', users);

    const { password: _, ...userWithoutPassword } = users[userIndex];

    logger.success(`Perfil atualizado: ${userWithoutPassword.email}`);
    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: userWithoutPassword
    });

  } catch (error) {
    logger.error('Erro ao atualizar perfil', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE FOTO DE PERFIL ====================

// Atualizar foto de perfil - POST
router.post('/profile/photo', require('../middleware/auth'), async (req, res) => {
  try {
    const { photo } = req.body;
    logger.info(`Atualizando foto para usuário ID: ${req.userId}`);
    
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    users[userIndex].profileImage = photo || null;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeJSON('users.json', users);

    const { password: _, ...userWithoutPassword } = users[userIndex];

    logger.success(`Foto de perfil atualizada: ${userWithoutPassword.email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Foto atualizada com sucesso',
      user: userWithoutPassword
    });

  } catch (error) {
    logger.error('Erro ao atualizar foto', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar foto de perfil - PUT (alternativa)
router.put('/profile/photo', require('../middleware/auth'), async (req, res) => {
  try {
    const { photo } = req.body;
    logger.info(`Atualizando foto (PUT) para usuário ID: ${req.userId}`);
    
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    users[userIndex].profileImage = photo || null;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeJSON('users.json', users);

    const { password: _, ...userWithoutPassword } = users[userIndex];

    logger.success(`Foto de perfil atualizada (PUT): ${userWithoutPassword.email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Foto atualizada com sucesso',
      user: userWithoutPassword
    });

  } catch (error) {
    logger.error('Erro ao atualizar foto (PUT)', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Remover foto de perfil
router.delete('/profile/photo', require('../middleware/auth'), async (req, res) => {
  try {
    logger.info(`Removendo foto do usuário ID: ${req.userId}`);
    
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    users[userIndex].profileImage = null;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeJSON('users.json', users);

    const { password: _, ...userWithoutPassword } = users[userIndex];

    logger.success(`Foto removida: ${userWithoutPassword.email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Foto removida com sucesso',
      user: userWithoutPassword
    });

  } catch (error) {
    logger.error('Erro ao remover foto', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar senha
router.patch('/profile/password', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Senha atual incorreta' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    users[userIndex].updatedAt = new Date().toISOString();

    await writeJSON('users.json', users);

    logger.success(`Senha atualizada: ${users[userIndex].email}`);
    res.status(200).json({ success: true, message: 'Senha atualizada com sucesso' });

  } catch (error) {
    logger.error('Erro ao atualizar senha', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Deletar conta
router.delete('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    await writeJSON('users.json', users);

    try {
      const appointments = await readJSON('appointments.json');
      const filteredAppointments = appointments.filter(a => a.userId !== req.userId);
      await writeJSON('appointments.json', filteredAppointments);
    } catch (error) {
      logger.warning('Erro ao remover agendamentos', error);
    }

    logger.success(`Conta deletada: ${deletedUser.email}`);
    res.status(200).json({ success: true, message: 'Conta deletada com sucesso' });

  } catch (error) {
    logger.error('Erro ao deletar conta', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router;