const express = require('express');
const authMiddleware = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileHandler');
const { sendAppointmentConfirmation } = require('../services/emailService');
const { ResponseMessages } = require('../middleware/responseMessages');
const logger = require('../utils/logger');

const router = express.Router();

const ALL_TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

// Listar agendamentos do usuário
router.get('/my-appointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await readJSON('appointments.json');
    const userAppointments = appointments.filter(
      app => app.userId === req.userId
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (userAppointments.length === 0) {
      return res.warning('NO_APPOINTMENTS', { appointments: [] });
    }
    
    logger.success(`${userAppointments.length} agendamentos encontrados`);
    res.success('APPOINTMENTS_FETCHED', userAppointments);

  } catch (error) {
    logger.error('Erro ao buscar agendamentos', error);
    res.error('INTERNAL_ERROR', error.message);
  }
});

// Ver horários disponíveis
router.get('/available-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.error('INVALID_DATE');
    }

    const appointments = await readJSON('appointments.json');
    const bookedSlots = appointments
      .filter(app => app.date === date && app.status === 'confirmed')
      .map(app => app.time);
    
    const availableSlots = ALL_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
    
    if (availableSlots.length === 0) {
      return res.warning('NO_SLOTS_AVAILABLE', { date, availableSlots: [] });
    }
    
    logger.success(`${availableSlots.length} horários disponíveis para ${date}`);
    res.success('SLOTS_FETCHED', {
      date,
      availableSlots,
      allSlots: ALL_TIME_SLOTS,
      bookedSlots
    });

  } catch (error) {
    logger.error('Erro ao buscar horários', error);
    res.error('INTERNAL_ERROR', error.message);
  }
});

// Criar novo agendamento
router.post('/appointments', authMiddleware, async (req, res) => {
  try {
    const { service, date, time, notes } = req.body;
    logger.info(`📅 Criando agendamento: ${service} em ${date} às ${time}`);

    if (!service || !date || !time) {
      return res.error('MISSING_FIELDS');
    }

    if (!ALL_TIME_SLOTS.includes(time)) {
      return res.error('INVALID_TIME');
    }

    // Verifica data futura
    const appointmentDate = new Date(`${date}T${time}:00`);
    if (appointmentDate < new Date()) {
      return res.error('INVALID_DATE');
    }

    // Buscar usuário
    const users = await readJSON('users.json');
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
      return res.error('USER_NOT_FOUND');
    }

    const appointments = await readJSON('appointments.json');

    // Verificar conflito
    const conflict = appointments.find(
      app => app.date === date && app.time === time && app.status === 'confirmed'
    );

    if (conflict) {
      logger.warning(`Horário conflitante: ${date} ${time}`);
      return res.error('SLOT_UNAVAILABLE');
    }

    // Criar agendamento
    const newAppointment = {
      id: Date.now(),
      userId: req.userId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      service,
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

    // Enviar email
    const emailResult = await sendAppointmentConfirmation(user.email, {
      service,
      date,
      time,
      appointmentId: newAppointment.id
    });

    if (!emailResult.success) {
      logger.warning(`Email não enviado para ${user.email}`);
      return res.warning('EMAIL_NOT_SENT', newAppointment);
    }

    logger.success(`Email enviado para ${user.email}`);
    res.success('APPOINTMENT_CREATED', newAppointment);

  } catch (error) {
    logger.error('Erro ao criar agendamento', error);
    res.error('INTERNAL_ERROR', error.message);
  }
});

// Cancelar agendamento
router.delete('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const appointments = await readJSON('appointments.json');
    
    const appointmentIndex = appointments.findIndex(
      app => app.id === parseInt(id) && app.userId === req.userId
    );

    if (appointmentIndex === -1) {
      return res.error('APPOINTMENT_NOT_FOUND');
    }

    const appointment = appointments[appointmentIndex];
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
    const hoursDiff = (appointmentDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      logger.warning(`Tentativa de cancelamento tardio: ${id}`);
      return res.error('CANCELLATION_TOO_LATE');
    }

    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date().toISOString();
    
    await writeJSON('appointments.json', appointments);
    logger.success(`Agendamento cancelado: ${id}`);

    res.success('APPOINTMENT_CANCELLED', appointments[appointmentIndex]);

  } catch (error) {
    logger.error('Erro ao cancelar agendamento', error);
    res.error('INTERNAL_ERROR', error.message);
  }
});

module.exports = router;