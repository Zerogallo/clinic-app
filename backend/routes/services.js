const express = require('express');
const { ResponseMessages } = require('../middleware/responseMessages');
const logger = require('../utils/logger');

const router = express.Router();

const servicesList = [
  {
    id: 1,
    title: "Despigmentação de sobrancelhas",
    description: "Remoção de micropigmentação a laser e química, para despigmentar as sobrancelhas de forma saudáveis e segura.",
    duration: 60,
    price: 250.00,
    category: "sobrancelhas"
  },
  {
    id: 2,
    title: "Remoção de tatuagem",
    description: "Tecnologia avançada para remover sua tatuagem com segurança e técnica.",
    duration: 30,
    price: 200.00,
    category: "tatuagem"
  },
  // ... (os outros 7 serviços)
];

// Listar todos os serviços
router.get('/', (req, res) => {
  logger.info(`📋 Listando ${servicesList.length} serviços`);
  res.success('SERVICES_FETCHED', servicesList);
});

// Buscar serviço por ID
router.get('/:id', (req, res) => {
  const service = servicesList.find(s => s.id === parseInt(req.params.id));
  if (!service) {
    return res.error('INVALID_DATA');
  }
  logger.success(`Serviço encontrado: ${service.title}`);
  res.success('SERVICES_FETCHED', service);
});

// Buscar por categoria
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const filtered = servicesList.filter(s => s.category === category);
  logger.info(`Buscando serviços da categoria: ${category} (${filtered.length} encontrados)`);
  res.success('SERVICES_FETCHED', filtered);
});

module.exports = router;