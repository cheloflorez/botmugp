const { EmbedBuilder, MessageFlags } = require('discord.js');
const path = require('path');

async function handleInteraction(interaction) {
    // Cargar la imagen desde la carpeta del bot

    const { AttachmentBuilder } = require('discord.js');

    const filePath = path.join(__dirname, '..', 'data', 'tca.png'); // __dirname apunta a MuBOTBACK/bot
    const file = new AttachmentBuilder(filePath);

    const embed = new EmbedBuilder()
        .setColor(0x8A2BE2) // violeta mágico
        .setTitle('🔮 Talisman of Chaos Assembly (BOUND)')
        .setDescription(
            'El **Talisman of Chaos Assembly (BOUND)** es un ítem que se utiliza en la **Máquina del Chaos**.\n\n' +
            '👉 Sirve para **proteger tus ítems** durante el proceso de combinación, evitando que se destruyan en caso de fallo.\n\n' +
            '⚠️ Solo funciona con **sets y armas**.\n' +
            '⚠️ Su uso **reduce un 5% el rate** de la Máquina del Chaos.'
        )
        .setImage('attachment://tca.png')
        .addFields(
            { name: '📌 Función principal', value: 'Evita la pérdida de ítems al fallar una combinación en la Chaos Machine.' },
            { name: '⚙️ Usos comunes', value: 'Combinación de sets y armas de alto riesgo.' },
            { name: '💡 Nota', value: 'El TCA BOUND se consume aunque la combinación falle y reduce un 5% el rate de éxito.' }
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

    await interaction.reply({
        embeds: [embed],
        files: [file],
        flags: MessageFlags.Ephemeral // Mensaje solo visible para el usuario
    });
}

module.exports = { handleInteraction };
