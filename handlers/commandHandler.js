const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const log = require('../utils/logger');

/**
 * Carga todos los comandos desde la carpeta /commands
 * @param {Client} client - Cliente de Discord.js
 */
function loadCommands(client) {
    // Crear Collection para almacenar comandos
    client.commands = new Collection();
    
    const commandsPath = path.join(__dirname, '..', 'commands');
    
    // Verificar que existe la carpeta
    if (!fs.existsSync(commandsPath)) {
        log.warn('Commands folder not found, creating it...');
        fs.mkdirSync(commandsPath);
        return;
    }
    
    // Leer todos los archivos .js
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    if (commandFiles.length === 0) {
        log.warn('No command files found in /commands');
        return;
    }
    
    log.info(`Loading ${commandFiles.length} command(s)...`);
    
    let loaded = 0;
    let failed = 0;
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        
        try {
            const command = require(filePath);
            
            // Verificar estructura del comando
            if (!command.data || !command.execute) {
                log.warn(`Command ${file} is missing required properties (data or execute)`);
                failed++;
                continue;
            }
            
            // Obtener el nombre del comando
            const commandName = command.data.name || command.data.toJSON?.().name;
            
            if (!commandName) {
                log.warn(`Command ${file} has no name property`);
                failed++;
                continue;
            }
            
            // Agregar a la collection
            client.commands.set(commandName, command);
            loaded++;
            
            log.info(`Loaded command: /${commandName}`, { file });
            
        } catch (error) {
            log.error(`Failed to load command ${file}`, error);
            failed++;
        }
    }
    
    log.info(`Commands loaded: ${loaded} successful, ${failed} failed`);
}

/**
 * Recarga todos los comandos (útil para desarrollo)
 * @param {Client} client - Cliente de Discord.js
 */
function reloadCommands(client) {
    // Limpiar el require cache para los comandos
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        delete require.cache[require.resolve(filePath)];
    }
    
    // Limpiar la collection
    client.commands?.clear();
    
    // Recargar
    loadCommands(client);
    
    log.info('Commands reloaded');
}

module.exports = {
    loadCommands,
    reloadCommands
};