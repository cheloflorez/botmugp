const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Importar utilidades
const config = require('./configs/config.js');
const log = require('./utils/logger');
const metrics = require('./utils/metrics');
const { loadCommands } = require('./handlers/commandHandler');

// Crear cliente
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel]
});

// Cargar comandos automáticamente
log.info('Loading commands...');
loadCommands(client);

// Cargar eventos automáticamente
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
});

// Manejo de errores del cliente
client.on('error', (error) => {
    log.error('Discord client error', error);
    metrics.trackError('client_error', error);
});

client.on('warn', (warning) => {
    log.warn('Discord client warning', { warning });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    log.error('Unhandled promise rejection', error);
    metrics.trackError('unhandled_rejection', error);
});

process.on('uncaughtException', (error) => {
    log.error('Uncaught exception', error);
    metrics.trackError('uncaught_exception', error);
    
    // Realizar shutdown graceful
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Graceful shutdown (SIN health check)
async function gracefulShutdown(signal) {
    log.info(`Received ${signal}, starting graceful shutdown...`);
    
    // Timeout de seguridad: si no termina en 5 segundos, forzar salida
    const forceExitTimeout = setTimeout(() => {
        log.warn('Graceful shutdown timeout, forcing exit');
        process.exit(1);
    }, 5000);
    
    try {
        // 1. Log de métricas finales
        log.info('Logging final metrics...');
        try {
            metrics.logMetrics();
        } catch (e) {
            log.warn('Could not log metrics', { error: e.message });
        }
        
        // 2. Destruir cliente de Discord
        log.info('Destroying Discord client...');
        try {
            client.destroy();
        } catch (e) {
            log.warn('Could not destroy client', { error: e.message });
        }
        
        // 3. Dar tiempo para que se completen operaciones pendientes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        log.info('Graceful shutdown completed');
        clearTimeout(forceExitTimeout);
        process.exit(0);
    } catch (error) {
        log.error('Error during graceful shutdown', error);
        clearTimeout(forceExitTimeout);
        process.exit(1);
    }
}

// Capturar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Login y start
async function start() {
    try {
        log.info('Starting bot...', {
            env: config.env,
            nodeVersion: process.version
        });
        
        await client.login(config.discord.token);
        
        log.info('Bot started successfully');
    } catch (error) {
        log.error('Failed to start bot', error);
        process.exit(1);
    }
}

start();