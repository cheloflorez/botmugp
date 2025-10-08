const { Events, MessageFlags } = require('discord.js');
const buttonHandlers = require('../handlers/buttonHandlers');
const selectHandlers = require('../handlers/selectHandlers');
const modalHandlers = require('../handlers/modalHandlers');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // Manejar botones
            if (interaction.isButton()) {
                console.log(`🔘 Button: ${interaction.customId}`);
                await buttonHandlers.handleButton(interaction);
            }
            // Manejar select menus
            else if (interaction.isStringSelectMenu()) {
                console.log(`📋 Select: ${interaction.customId}`);
                selectHandlers.handleSelect(interaction);
            }
            // Manejar modales
            else if (interaction.isModalSubmit()) {
                console.log(`📝 Modal: ${interaction.customId}`);
                await modalHandlers.handleModal(interaction);
            }
            // Manejar comandos slash
            else if (interaction.isChatInputCommand()) {
                console.log(`⚡ Command: /${interaction.commandName} by ${interaction.user.tag}`);
                
                // 🔑 ESTO ES LO IMPORTANTE - Buscar comando en client.commands
                const command = interaction.client.commands.get(interaction.commandName);
                
                if (!command) {
                    console.log(`❌ Command not found: ${interaction.commandName}`);
                    return interaction.reply({
                        content: '❌ Este comando no existe.',
                        flags: MessageFlags.Ephemeral
                    });
                }
                
                // Ejecutar el comando
                try {
                    console.log(`✅ Executing command: ${interaction.commandName}`);
                    await command.execute(interaction);
                    console.log(`✅ Command completed: ${interaction.commandName}`);
                } catch (error) {
                    console.error(`❌ Error executing command: ${interaction.commandName}`, error);
                    
                    const errorMessage = {
                        content: '❌ Hubo un error al ejecutar este comando.',
                        flags: MessageFlags.Ephemeral
                    };
                    
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply(errorMessage);
                    } else {
                        await interaction.followUp(errorMessage);
                    }
                }
            }
        } catch (err) {
            console.error('❌ Error en interactionCreate:', err);
            console.error('Stack:', err.stack);
            
            try {
                const errorMessage = { 
                    content: 'Ocurrió un error al procesar tu solicitud.', 
                    flags: MessageFlags.Ephemeral 
                };
                
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply(errorMessage);
                } else {
                    await interaction.followUp(errorMessage);
                }
            } catch (e) {
                console.error('⚠️ No se pudo notificar al usuario sobre el error:', e);
            }
        }
    }
};