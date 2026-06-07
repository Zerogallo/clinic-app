require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const { responseMiddleware } = require('./middleware/responseMessages');

// Importar rotas
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const serviceRoutes = require('./routes/services');

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Log de todas as requisições
app.use(responseMiddleware); // Sistema de respostas padronizadas

// Banner de inicialização
logger.banner('💄 Beauty Clinic API', 'Sistema de Gestão de Clínica de Estética');

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', appointmentRoutes);
app.use('/api/services', serviceRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz com documentação
app.get('/', (req, res) => {
  logger.info('📖 Documentação da API solicitada');
  res.json({
    name: 'Beauty Clinic API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: {
        register: { method: 'POST', url: '/api/auth/register', body: { name: 'string', email: 'string', password: 'string', phone: 'string (opcional)' } },
        login: { method: 'POST', url: '/api/auth/login', body: { email: 'string', password: 'string' } },
        profile: { method: 'GET', url: '/api/auth/profile', auth: true }
      },
      appointments: {
        myAppointments: { method: 'GET', url: '/api/my-appointments', auth: true },
        availableSlots: { method: 'GET', url: '/api/available-slots/:date', auth: false },
        create: { method: 'POST', url: '/api/appointments', auth: true, body: { service: 'string', date: 'YYYY-MM-DD', time: 'HH:MM', notes: 'string (opcional)' } },
        cancel: { method: 'DELETE', url: '/api/appointments/:id', auth: true }
      },
      services: {
        list: { method: 'GET', url: '/api/services' },
        getById: { method: 'GET', url: '/api/services/:id' },
        byCategory: { method: 'GET', url: '/api/services/category/:category' }
      }
    },
    documentation: 'Para usar as rotas autenticadas, inclua o header: Authorization: Bearer <seu_token>'
  });
});

// Middleware de erro 404
app.use((req, res) => {
  logger.warning(`Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 404,
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.url} não existe na API`,
    availableEndpoints: '/'
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  logger.error('Erro não tratado', err);
  res.status(500).json({
    status: 500,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.divider();
  logger.success(`🚀 Servidor rodando em http://localhost:${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📧 Email service: ${process.env.EMAIL_USER ? 'Configurado' : 'Não configurado'}`);
  logger.divider();
  
  // Mostrar endpoints principais
  const endpoints = [
    ['GET', '/', 'Documentação'],
    ['GET', '/health', 'Health Check'],
    ['POST', '/api/auth/register', 'Registrar usuário'],
    ['POST', '/api/auth/login', 'Login'],
    ['GET', '/api/services', 'Listar serviços']
  ];
  
  logger.table(['Método', 'Endpoint', 'Descrição'], endpoints);
  logger.divider();
});