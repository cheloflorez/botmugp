const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { helpChannelId } = require('../config.json');

async function sendHomeMenu(client) {
    const channel = await client.channels.fetch(helpChannelId);
    if (!channel) {
        console.log('❌ No se encontró el canal del menú');
        return;
    }

    const pinnedMessages = await channel.messages.fetchPins();

    // Accedemos al array de mensajes
    const pinnedArray = pinnedMessages.items.map(item => item.message);

    const existingMenu = pinnedArray.find(
        m => m.author.id === client.user.id && m.embeds.length > 0
    );

    // Embed principal
    const helpEmbed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle('📖 Menú de Ayuda')
        .setDescription(
            '**Selecciona un módulo para continuar:**\n\n' +
            '📊 **Calculadora de Nivel**\n' +
            ' Calcula a que nivel vas a llegar basado en tiempo y exp/segundo.\n\n' +
            '📊 **Calculadora de Tiempo**\n' +
            ' Calcula cuánto tiempo necesitas para llegar a un nivel deseado.\n\n' +
            '🎯 **Spots**\n' +
            ' Busca los spots más efectivos y consulta mapas.\n\n' +
            '🌀 **Maze Helper**\n' +
            ' Te guía a través del Maze of Dimension.\n\n' +
            '🧾 **TCA Bound**\n' +
            ' Información general sobre el TCA Bound.\n\n' +
            '⚠️ **GAP**\n' +
            ' Muestra penalización de nivel por mapa.'
        )
        .setFooter({ text: 'Powered by Chelo', iconURL: client.user.displayAvatarURL() });


    // Botones
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_levelcalc')
            .setLabel('📊 Calculadora de Nivel')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('open_timecalc')
            .setLabel('📊 Calculadora de Tiempo')
            .setStyle(ButtonStyle.Primary),
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_spots')
            .setLabel('🎯 Spots')
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId('open_mazehelper')
            .setLabel('🌀 Maze Helper')
            .setStyle(ButtonStyle.Secondary),

    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_gap')
            .setLabel('⚠️ GAP')
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId('open_tca')
            .setLabel('🧾 TCA Bound')
            .setStyle(ButtonStyle.Secondary)
    );


    if (existingMenu) {
        await existingMenu.edit({ embeds: [helpEmbed], components: [row1, row2, row3] });
        console.log('♻️ Menú principal actualizado.');
    } else {
        const message = await channel.send({ embeds: [helpEmbed], components: [row1, row2, row3] });
        await message.pin();
        console.log('📌 Menú principal enviado y fijado.');
    }
}

module.exports = { sendHomeMenu };
