const express = require('express');
const authMiddleware = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileHandler');
const { sendAppointmentConfirmation, sendAppointmentCancellation } = require('../services/emailService');
const logger = require('../utils/logger');

const router = express.Router();

// Horários disponíveis (30 minutos de intervalo)
const ALL_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

// ==================== ROTAS DE AGENDAMENTOS ====================

// Listar agendamentos do usuário logado
router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    logger.info(`📋 Buscando agendamentos para usuário: ${req.userId}`);
    
    const appointments = await readJSON('appointments.json');
    const userAppointments = appointments.filter(
      app => app.userId === req.userId && app.status !== 'cancelled'
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (userAppointments.length === 0) {
      logger.info(`Nenhum agendamento encontrado para usuário: ${req.userId}`);
      return res.status(200).json({
        success: true,
        message: 'Nenhum agendamento encontrado',
        appointments: []
      });
    }
    
    logger.success(`${userAppointments.length} agendamentos encontrados`);
    res.status(200).json({
      success: true,
      message: 'Agendamentos listados com sucesso',
      appointments: userAppointments
    });

  } catch (error) {
    logger.error('Erro ao buscar agendamentos', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Listar todos os agendamentos (apenas admin)
router.get('/admin/appointments', authMiddleware, async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const currentUser = users.find(u => u.id === req.userId);
    
    if (!currentUser || currentUser.role !== 'admin') {
      logger.warning(`Tentativa de acesso admin negado: ${currentUser?.email}`);
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem ver todos os agendamentos.'
      });
    }
    
    const appointments = await readJSON('appointments.json');
    const allAppointments = appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    logger.success(`Admin ${currentUser.email} listou ${allAppointments.length} agendamentos`);
    res.status(200).json({
      success: true,
      message: 'Todos os agendamentos listados',
      appointments: allAppointments,
      total: allAppointments.length
    });

  } catch (error) {
    logger.error('Erro ao buscar todos agendamentos', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Ver horários disponíveis para uma data específica
router.get('/available-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validar formato da data (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de data inválido. Use YYYY-MM-DD'
      });
    }

    // Verificar se a data é futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível agendar em datas passadas'
      });
    }

    const appointments = await readJSON('appointments.json');
    const bookedSlots = appointments
      .filter(app => app.date === date && app.status === 'confirmed')
      .map(app => app.time);
    
    const availableSlots = ALL_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
    
    logger.success(`${availableSlots.length} horários disponíveis para ${date}`);
    res.status(200).json({
      success: true,
      message: 'Horários disponíveis obtidos com sucesso',
      data: {
        date,
        availableSlots,
        allSlots: ALL_TIME_SLOTS,
        bookedSlots,
        availableCount: availableSlots.length
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar horários', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo agendamento
router.post('/appointments', authMiddleware, async (req, res) => {
  try {
    const { serviceId, serviceName, price, date, time, notes } = req.body;
    logger.info(`📅 Criando agendamento: ${serviceName} em ${date} às ${time}`);

    // Validações
    if (!serviceName || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: serviceName, date, time'
      });
    }

    if (!ALL_TIME_SLOTS.includes(time)) {
      return res.status(400).json({
        success: false,
        error: 'Horário inválido'
      });
    }

    // Verifica data futura
    const appointmentDate = new Date(`${date}T${time}:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível agendar em datas passadas'
      });
    }

    // Buscar usuário
    const users = await readJSON('users.json');
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const appointments = await readJSON('appointments.json');

    // Verificar conflito de horário
    const conflict = appointments.find(
      app => app.date === date && app.time === time && app.status === 'confirmed'
    );

    if (conflict) {
      logger.warning(`Horário conflitante: ${date} ${time}`);
      return res.status(409).json({
        success: false,
        error: 'Horário já reservado'
      });
    }

    // Criar agendamento
    const newAppointment = {
      id: Date.now(),
      userId: req.userId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      serviceId: serviceId || null,
      serviceName,
      price: price || 0,
      date,
      time,
      notes: notes || '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    await writeJSON('appointments.json', appointments);
    logger.success(`Agendamento criado: ID ${newAppointment.id}`);

    // Enviar email de confirmação (não bloqueia a resposta)
    try {
      const emailResult = await sendAppointmentConfirmation(user.email, {
        userName: user.name,
        serviceName,
        date,
        time,
        price: price || 0,
        appointmentId: newAppointment.id
      });
      
      if (emailResult.success) {
        logger.success(`Email de confirmação enviado para ${user.email}`);
      } else {
        logger.warning(`Email não enviado para ${user.email}`);
      }
    } catch (emailError) {
      logger.warning(`Erro ao enviar email: ${emailError.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso! Enviamos a confirmação para seu email.',
      appointment: newAppointment
    });

  } catch (error) {
    logger.error('Erro ao criar agendamento', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Obter detalhes de um agendamento específico
router.get('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentId = parseInt(id);
    
    const appointments = await readJSON('appointments.json');
    const appointment = appointments.find(
      app => app.id === appointmentId && app.userId === req.userId
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });

  } catch (error) {
    logger.error('Erro ao buscar agendamento', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Cancelar agendamento
router.delete('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentId = parseInt(id);
    
    const appointments = await readJSON('appointments.json');
    const appointmentIndex = appointments.findIndex(
      app => app.id === appointmentId && app.userId === req.userId
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    const appointment = appointments[appointmentIndex];
    
    // Verificar se pode cancelar (24 horas de antecedência)
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
    const hoursDiff = (appointmentDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      logger.warning(`Tentativa de cancelamento tardio: ${id}`);
      return res.status(400).json({
        success: false,
        error: 'Cancelamento só permitido com 24 horas de antecedência'
      });
    }

    // Atualizar status
    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date().toISOString();
    appointments[appointmentIndex].updatedAt = new Date().toISOString();
    
    await writeJSON('appointments.json', appointments);
    logger.success(`Agendamento cancelado: ${id}`);

    // Enviar email de cancelamento
    try {
      const users = await readJSON('users.json');
      const user = users.find(u => u.id === req.userId);
      
      if (user) {
        await sendAppointmentCancellation(user.email, {
          userName: user.name,
          serviceName: appointment.serviceName,
          date: appointment.date,
          time: appointment.time
        });
        logger.success(`Email de cancelamento enviado para ${user.email}`);
      }
    } catch (emailError) {
      logger.warning(`Erro ao enviar email de cancelamento: ${emailError.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      appointment: appointments[appointmentIndex]
    });

  } catch (error) {
    logger.error('Erro ao cancelar agendamento', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Reagendar (alterar data/hora)
router.patch('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    const appointmentId = parseInt(id);
    
    if (!date && !time) {
      return res.status(400).json({
        success: false,
        error: 'Informe pelo menos uma nova data ou horário'
      });
    }
    
    const appointments = await readJSON('appointments.json');
    const appointmentIndex = appointments.findIndex(
      app => app.id === appointmentId && app.userId === req.userId
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    const appointment = appointments[appointmentIndex];
    const newDate = date || appointment.date;
    const newTime = time || appointment.time;

    // Verificar se o novo horário está disponível
    if (date || time) {
      const conflict = appointments.find(
        app => app.date === newDate && app.time === newTime && 
        app.status === 'confirmed' && app.id !== appointmentId
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          error: 'Horário já reservado'
        });
      }
      
      appointments[appointmentIndex].date = newDate;
      appointments[appointmentIndex].time = newTime;
    }
    
    appointments[appointmentIndex].updatedAt = new Date().toISOString();
    
    await writeJSON('appointments.json', appointments);
    logger.success(`Agendamento reagendado: ${id}`);

    // Enviar email de confirmação de reagendamento
    try {
      const users = await readJSON('users.json');
      const user = users.find(u => u.id === req.userId);
      
      if (user) {
        await sendAppointmentConfirmation(user.email, {
          userName: user.name,
          serviceName: appointment.serviceName,
          date: newDate,
          time: newTime,
          price: appointment.price,
          appointmentId: appointment.id
        }, true); // true = é um reagendamento
        logger.success(`Email de reagendamento enviado para ${user.email}`);
      }
    } catch (emailError) {
      logger.warning(`Erro ao enviar email de reagendamento: ${emailError.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'Agendamento reagendado com sucesso',
      appointment: appointments[appointmentIndex]
    });

  } catch (error) {
    logger.error('Erro ao reagendar', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de agendamentos (admin)
router.get('/admin/appointments/stats', authMiddleware, async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const currentUser = users.find(u => u.id === req.userId);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem ver estatísticas.'
      });
    }
    
    const appointments = await readJSON('appointments.json');
    
    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      today: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
      thisWeek: appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        return appointmentDate >= weekStart && a.status === 'confirmed';
      }).length,
      thisMonth: appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        const today = new Date();
        return appointmentDate.getMonth() === today.getMonth() && 
               appointmentDate.getFullYear() === today.getFullYear() &&
               a.status === 'confirmed';
      }).length
    };
    
    res.status(200).json({
      success: true,
      stats
    });
    
  } catch (error) {
    logger.error('Erro ao buscar estatísticas', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;