const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const { calcular } = require('../utils/calculatorLogic');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('calc_modal')
            .setTitle('📊 Calculadora');

        const nivelInput = new TextInputBuilder()
            .setCustomId('nivel')
            .setLabel('Nivel')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 1000')
            .setRequired(true);

        const tiempoInput = new TextInputBuilder()
            .setCustomId('tiempo')
            .setLabel('Tiempo (ej: 2d 5h 30m)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 2d 5h 30m')
            .setRequired(true);

        const expSegInput = new TextInputBuilder()
            .setCustomId('expSegundos') // ⚡ nombre actualizado
            .setLabel('Experiencia por segundo ( Sin puntos )')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 1500000')
            .setRequired(true);

        const porcentajeInput = new TextInputBuilder()
            .setCustomId('porcentaje')
            .setLabel('Porcentaje Mostrado en SWITCH (%)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 42')
            .setRequired(true);


        modal.addComponents(
            new ActionRowBuilder().addComponents(nivelInput),
            new ActionRowBuilder().addComponents(tiempoInput),
            new ActionRowBuilder().addComponents(expSegInput),
            new ActionRowBuilder().addComponents(porcentajeInput)
        );

        await interaction.showModal(modal);
    },

    async handleModal(interaction) {
        // Recoger inputs
        const nivel = parseInt(interaction.fields.getTextInputValue('nivel'));
        const tiempo = interaction.fields.getTextInputValue('tiempo');
        const expSegundos = parseInt(interaction.fields.getTextInputValue('expSegundos'));
        const porcentaje = parseInt(interaction.fields.getTextInputValue('porcentaje'));

        // --- Validaciones ---
        const errores = [];

        if (isNaN(nivel) || nivel < 1 || nivel > 1699) errores.push('⚠️ Nivel inválido (1-1699).');
        if (!/^(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?$/i.test(tiempo)) errores.push('⚠️ Formato de tiempo inválido. Ej: 2d 5h 30m');
        if (isNaN(expSegundos) || expSegundos <= 0) errores.push('⚠️ Experiencia/segundo inválida.');
        if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 99) errores.push('⚠️ Porcentaje debe estar entre 0 y 99.');

        if (errores.length > 0) {
            return interaction.reply({
                content: `❌ Se encontraron errores:\n- ${errores.join('\n- ')}`,
                flags: MessageFlags.Ephemeral
            });
        }

        // --- Llamar a la función de cálculo si todo es válido ---
        await calcular(interaction, { nivel, tiempo, exp: expSegundos, porcentaje });
    }

};
