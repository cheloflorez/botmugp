const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const replyAndDelete = require('../../utils/replyAndDelete.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spots')
        .setDescription('Muestra información de spots en Mu Online')
        .addStringOption(option =>
            option.setName('mapa')
                .setDescription('Selecciona el mapa')
                .setRequired(true)
                .addChoices(
                    { name: 'Kardamahal', value: 'Kardamahal' }
                ))
        .addStringOption(option =>
            option.setName('elemento')
                .setDescription('Selecciona el elemento del spot')
                .setRequired(true)
                .addChoices(
                    { name: '🔥 Fuego', value: 'Fuego' },
                    { name: '💧 Agua', value: 'Agua' },
                    { name: '🌱 Tierra', value: 'Tierra' },
                    { name: '🌪️ Viento', value: 'Viento' },
                    { name: '🌑 Oscuridad', value: 'Oscuridad' }
                ))
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Selecciona el tipo de spot')
                .setRequired(true)
                .addChoices(
                    { name: '⚔️ Main', value: 'Main' },
                    { name: '⚔️ Sub Main', value: 'Sub Main' },
                )),

    async execute(interaction) {
        const mapa = interaction.options.getString('mapa');
        const elemento = interaction.options.getString('elemento');
        const tipo = interaction.options.getString('tipo');

        // 📂 Ruta: /data/mapa/tipo/elemento.png
        const filePath = path.join(__dirname, '../data', mapa, tipo, `${elemento}.png`);

        let embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('📍 Información de Spot - Mu GP')
            .setThumbnail(interaction.client.user.displayAvatarURL()) 
            .addFields(
                { name: 'Mapa', value: mapa, inline: true },
                { name: 'Elemento', value: elemento, inline: true },
                { name: 'Tipo', value: tipo, inline: true }
            )
            .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        if (fs.existsSync(filePath)) {
            const attachment = new AttachmentBuilder(filePath);
            embed.setImage(`attachment://${elemento}.png`);
            await replyAndDelete(interaction,{ embeds: [embed], files: [attachment] });
        } else {
            embed.addFields({ name: '⚠️ Imagen', value: 'No se encontró ninguna imagen para este spot.' });
            await replyAndDelete(interaction,{ embeds: [embed] });
        }
    },
};
