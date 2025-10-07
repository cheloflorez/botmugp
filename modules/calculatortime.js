const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const { calcularTime } = require('../utils/calculatorLogic'); // Asegurate que calcularTime esté exportado en otro archivo

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('calc_modal_v2')
            .setTitle('📊 Calculadora de Nivel');

        // --- Inputs ---
        const nivelInicialInput = new TextInputBuilder()
            .setCustomId('nivel_inicial')
            .setLabel('Nivel inicial')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 1000')
            .setRequired(true);

        const nivelDeseadoInput = new TextInputBuilder()
            .setCustomId('nivel_deseado')
            .setLabel('Nivel deseado')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: 1200')
            .setRequired(true);

        const expSegundosInput = new TextInputBuilder()
            .setCustomId('expSegundos')
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
            new ActionRowBuilder().addComponents(nivelInicialInput),
            new ActionRowBuilder().addComponents(nivelDeseadoInput),
            new ActionRowBuilder().addComponents(expSegundosInput),
            new ActionRowBuilder().addComponents(porcentajeInput)
        );

        await interaction.showModal(modal);
    },

    async handleModal(interaction) {
        const nivel_inicial = parseInt(interaction.fields.getTextInputValue('nivel_inicial'));
        const nivel_deseado = parseInt(interaction.fields.getTextInputValue('nivel_deseado'));
        const expSegundos = parseInt(interaction.fields.getTextInputValue('expSegundos'));
        const porcentaje = parseInt(interaction.fields.getTextInputValue('porcentaje'));

        // --- VALIDACIONES ---
        const errores = [];
        if (isNaN(nivel_inicial) || nivel_inicial < 1 || nivel_inicial > 1699)
            errores.push('El nivel inicial debe estar entre 1 y 1699.');
        if (isNaN(nivel_deseado) || nivel_deseado < 1 || nivel_deseado > 1700)
            errores.push('El nivel deseado debe estar entre 1 y 1700.');
        if (!isNaN(nivel_inicial) && !isNaN(nivel_deseado) && nivel_inicial >= nivel_deseado)
            errores.push('El nivel inicial no puede ser mayor o igual al nivel deseado.');
        if (isNaN(expSegundos) || expSegundos <= 0)
            errores.push('La experiencia por segundo debe ser un número positivo.');
        if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 99)
            errores.push('El porcentaje debe estar entre 0 y 99.');

        if (errores.length > 0) {
            return interaction.reply({
                content: `❌ Errores en los datos:\n- ${errores.join('\n- ')}`,
                flags: MessageFlags.Ephemeral
            });
        }

        // --- CALCULO ---
        await calcularTime(interaction, { nivel_inicial, nivel_deseado, exp: expSegundos, porcentaje });
    },
};
