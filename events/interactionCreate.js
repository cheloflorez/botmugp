const { Events , MessageFlags } = require('discord.js');
const buttonHandlers = require('../handlers/buttonHandlers');
const selectHandlers = require('../handlers/selectHandlers');
const modalHandlers = require('../handlers/modalHandlers');
const logsCommand = require('../commands/logs'); // tu comando /logs

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isButton()) await buttonHandlers.handleButton(interaction);
            else if (interaction.isStringSelectMenu()) selectHandlers.handleSelect(interaction);
            else if (interaction.isModalSubmit()) await modalHandlers.handleModal(interaction);
            else if (interaction.isChatInputCommand()) {
                const command = interaction.commandName;
                if (command === 'logs') {
                    await logsCommand.execute(interaction);
                    return;
                }
            }
        } catch (err) {
            console.error('❌ Error en interactionCreate:', err);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'Ocurrió un error.', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.followUp({ content: 'Ocurrió un error.', flags: MessageFlags.Ephemeral });
                }
            } catch (e) {
                console.error('⚠️ No se pudo notificar al usuario sobre el error:', e);
            }
        }
    }
};
