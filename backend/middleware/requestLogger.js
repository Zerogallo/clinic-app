const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log da requisição
  logger.request(req.method, req.url);
  
  // Log dos dados da requisição (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
    const sensitiveFields = ['password', 'token'];
    const safeBody = { ...req.body };
    sensitiveFields.forEach(field => {
      if (safeBody[field]) safeBody[field] = '***';
    });
    logger.info(`📦 Body: ${JSON.stringify(safeBody)}`);
  }
  
  // Interceptar resposta
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Log da resposta
    if (status >= 200 && status < 300) {
      logger.success(`Resposta ${status} (${duration}ms)`);
    } else if (status >= 400) {
      logger.error(`Resposta ${status} (${duration}ms) - ${data.message || ''}`);
    }
    
    originalJson.call(this, data);
  };
  
  next();
};

module.exports = requestLogger;