const { EmbedBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');

async function handleInteraction(interaction) {
    // Cargar la imagen desde la carpeta del bot
    const file = new AttachmentBuilder('./data/gap.png');

    const embed = new EmbedBuilder()
        .setColor(0xE74C3C) // rojo llamativo
        .setTitle('📉 GAP de Nivel en Mu Online')
        .setDescription(
            'El **GAP de Nivel** es una **penalización para cazar** que ocurre cuando tu personaje no tiene el nivel requerido en un mapa específico.\n\n' +
            '👉 Esto significa que **no harás todo el daño ni tendrás toda tu defensa real** hasta alcanzar el nivel adecuado.\n\n' +
            'Por ejemplo: en **Deep Dungeon 3** necesitas ser al menos nivel **770** para no sufrir penalización.'
        )
        .setImage('attachment://gap.png')
        .addFields(
            { name: '🔴 Indicador de penalización', value: 'Si el nombre de los monstruos aparece en **ROJO**, significa que aún tienes GAP de nivel.' },
            { name: '🔵 Sin penalización', value: 'Cuando el nombre de los monstruos aparece en **AZUL**, significa que ya no tienes GAP.' }
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

    await interaction.reply({
        embeds: [embed],
        files: [file],
        flags: MessageFlags.Ephemeral // Mensaje solo visible para quien lo ejecuta
    });
}

module.exports = { handleInteraction };
