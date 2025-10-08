const winston = require('winston');
const path = require('path');

// Crear formato personalizado
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        // Agregar metadata si existe
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        // Agregar stack trace si existe
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

// Configurar logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        // Logs de errores en archivo separado
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Todos los logs
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Console en desarrollo
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        })
    ]
});

// Wrapper para facilitar el uso
const log = {
    info: (message, meta = {}) => logger.info(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    error: (message, error = null, meta = {}) => {
        if (error instanceof Error) {
            logger.error(message, { ...meta, stack: error.stack, error: error.message });
        } else {
            logger.error(message, meta);
        }
    },
    debug: (message, meta = {}) => logger.debug(message, meta),
};

module.exports = log;