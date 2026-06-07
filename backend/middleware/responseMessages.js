const logger = require('../utils/logger');

// Padrão de respostas da API
const ResponseMessages = {
  // Sucessos
  SUCCESS: {
    USER_CREATED: { status: 201, message: '✅ Usuário criado com sucesso! Bem-vindo à Beauty Clinic.' },
    LOGIN_SUCCESS: { status: 200, message: '🎉 Login realizado com sucesso! Redirecionando...' },
    APPOINTMENT_CREATED: { status: 201, message: '📅 Agendamento confirmado! Enviamos um email com os detalhes.' },
    APPOINTMENT_CANCELLED: { status: 200, message: '🗑️ Agendamento cancelado com sucesso. Sentiremos sua falta!' },
    PROFILE_FETCHED: { status: 200, message: '👤 Perfil carregado com sucesso.' },
    APPOINTMENTS_FETCHED: { status: 200, message: '📋 Agendamentos carregados com sucesso.' },
    SLOTS_FETCHED: { status: 200, message: '⏰ Horários disponíveis carregados.' },
    SERVICES_FETCHED: { status: 200, message: '💆‍♀️ Serviços carregados com sucesso.' },
    EMAIL_SENT: { status: 200, message: '📧 Email de confirmação enviado com sucesso!' }
  },

  // Erros comuns
  ERRORS: {
    // Autenticação
    INVALID_CREDENTIALS: { status: 401, message: '❌ Email ou senha inválidos. Tente novamente.' },
    TOKEN_NOT_FOUND: { status: 401, message: '🔒 Acesso negado. Faça login para continuar.' },
    TOKEN_EXPIRED: { status: 401, message: '⏰ Sessão expirada. Faça login novamente.' },
    TOKEN_INVALID: { status: 401, message: '🔐 Token inválido. Por favor, faça login novamente.' },
    
    // Usuário
    USER_ALREADY_EXISTS: { status: 409, message: '📧 Este email já está cadastrado. Use outro email ou faça login.' },
    USER_NOT_FOUND: { status: 404, message: '👤 Usuário não encontrado.' },
    PASSWORD_TOO_SHORT: { status: 400, message: '🔑 A senha deve ter pelo menos 6 caracteres.' },
    
    // Agendamentos
    SLOT_UNAVAILABLE: { status: 409, message: '⏰ Horário indisponível! Escolha outro horário por favor.' },
    INVALID_DATE: { status: 400, message: '📅 Data inválida. Por favor, escolha uma data futura.' },
    INVALID_TIME: { status: 400, message: '⏰ Horário inválido. Nosso horário de funcionamento é 09h às 18h.' },
    APPOINTMENT_NOT_FOUND: { status: 404, message: '📅 Agendamento não encontrado.' },
    CANCELLATION_TOO_LATE: { status: 400, message: '⚠️ Cancelamentos devem ser feitos com 24h de antecedência.' },
    
    // Dados
    MISSING_FIELDS: { status: 400, message: '📝 Por favor, preencha todos os campos obrigatórios.' },
    INVALID_DATA: { status: 400, message: '🔍 Dados inválidos. Verifique as informações.' },
    
    // Servidor
    INTERNAL_ERROR: { status: 500, message: '💥 Erro interno do servidor. Tente novamente mais tarde.' },
    DATABASE_ERROR: { status: 500, message: '💾 Erro ao acessar dados. Contate o suporte.' }
  },

  // Avisos
  WARNINGS: {
    EMAIL_NOT_SENT: { status: 200, message: '⚠️ Agendamento criado, mas não foi possível enviar o email.' },
    NO_APPOINTMENTS: { status: 200, message: '📭 Você ainda não tem agendamentos. Que tal marcar um?' },
    NO_SLOTS_AVAILABLE: { status: 200, message: '😢 Não há horários disponíveis para esta data.' }
  },

  // Helpers
  getSuccess(key, data = null) {
    const response = this.SUCCESS[key];
    logger.success(response.message);
    return { ...response, data };
  },

  getError(key, details = null) {
    const response = this.ERRORS[key];
    logger.error(response.message);
    const errorResponse = { ...response };
    if (details && process.env.NODE_ENV === 'development') {
      errorResponse.details = details;
    }
    return errorResponse;
  },

  getWarning(key, data = null) {
    const response = this.WARNINGS[key];
    logger.warning(response.message);
    return { ...response, data };
  }
};

// Middleware para respostas automáticas
const responseMiddleware = (req, res, next) => {
  // Adiciona métodos helpers ao res
  res.success = (key, data = null, extraData = {}) => {
    const response = ResponseMessages.getSuccess(key, data);
    return res.status(response.status).json({ ...response, ...extraData });
  };

  res.error = (key, details = null) => {
    const response = ResponseMessages.getError(key, details);
    return res.status(response.status).json(response);
  };

  res.warning = (key, data = null) => {
    const response = ResponseMessages.getWarning(key, data);
    return res.status(response.status).json(response);
  };

  next();
};

module.exports = { ResponseMessages, responseMiddleware };