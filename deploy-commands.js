const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

// Creamos el comando de ejemplo
const commands = [
    new SlashCommandBuilder()
        .setName('logs') // o 'logs'
        .setDescription('Muestra estadísticas de uso del bot (solo admins)')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('🚀 Registrando comandos de aplicación (slash) en el servidor...');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log('✅ Comandos registrados correctamente!');
    } catch (error) {
        console.error(error);
    }
})();
