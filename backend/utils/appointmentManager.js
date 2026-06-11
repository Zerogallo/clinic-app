const { readJSON, writeJSON } = require('./fileHandler');
const logger = require('./logger');

const APPOINTMENTS_FILE = 'appointments.json';

// Criar agendamento
async function createAppointment(appointmentData) {
  try {
    const appointments = await readJSON(APPOINTMENTS_FILE);
    
    const newAppointment = {
      id: Date.now(),
      ...appointmentData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    await writeJSON(APPOINTMENTS_FILE, appointments);
    
    logger.success(`Agendamento criado: ${newAppointment.id}`);
    return newAppointment;
    
  } catch (error) {
    logger.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

// Listar agendamentos do usuário
async function getUserAppointments(userId) {
  try {
    const appointments = await readJSON(APPOINTMENTS_FILE);
    const userAppointments = appointments.filter(
      app => app.userId === userId && app.status !== 'cancelled'
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return userAppointments;
    
  } catch (error) {
    logger.error('Erro ao listar agendamentos:', error);
    throw error;
  }
}

// Cancelar agendamento
async function cancelAppointment(appointmentId, userId) {
  try {
    const appointments = await readJSON(APPOINTMENTS_FILE);
    const index = appointments.findIndex(
      app => app.id === parseInt(appointmentId) && app.userId === userId
    );
    
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    appointments[index].status = 'cancelled';
    appointments[index].cancelledAt = new Date().toISOString();
    appointments[index].updatedAt = new Date().toISOString();
    
    await writeJSON(APPOINTMENTS_FILE, appointments);
    
    logger.success(`Agendamento cancelado: ${appointmentId}`);
    return appointments[index];
    
  } catch (error) {
    logger.error('Erro ao cancelar agendamento:', error);
    throw error;
  }
}

// Verificar disponibilidade de horário
async function checkAvailability(date, time) {
  try {
    const appointments = await readJSON(APPOINTMENTS_FILE);
    const existing = appointments.find(
      app => app.date === date && app.time === time && app.status === 'confirmed'
    );
    
    return !existing;
    
  } catch (error) {
    logger.error('Erro ao verificar disponibilidade:', error);
    throw error;
  }
}

// Obter horários disponíveis
async function getAvailableSlots(date, allSlots) {
  try {
    const appointments = await readJSON(APPOINTMENTS_FILE);
    const bookedSlots = appointments
      .filter(app => app.date === date && app.status === 'confirmed')
      .map(app => app.time);
    
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    return {
      date,
      availableSlots,
      bookedSlots,
      totalSlots: allSlots.length,
      availableCount: availableSlots.length
    };
    
  } catch (error) {
    logger.error('Erro ao obter horários disponíveis:', error);
    throw error;
  }
}

// Listar todos os agendamentos (admin)
async function getAllAppointments() {
  try {
    const appointments = await readJSON(APPOINTMENTS_FILE);
    return appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
  } catch (error) {
    logger.error('Erro ao listar todos agendamentos:', error);
    throw error;
  }
}

module.exports = {
  createAppointment,
  getUserAppointments,
  cancelAppointment,
  checkAvailability,
  getAvailableSlots,
  getAllAppointments
};