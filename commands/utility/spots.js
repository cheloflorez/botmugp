const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spots')
        .setDescription('Muestra información de spots en Mu Online')
        .addStringOption(option =>
            option.setName('mapa')
                .setDescription('Selecciona el mapa')
                .setRequired(true)
                .addChoices(
                    { name: 'Lorencia', value: 'lorencia' },
                    { name: 'Atlans', value: 'atlans' },
                    { name: 'Icarus', value: 'icarus' },
                    { name: 'Arena', value: 'arena' }
                ))
        .addStringOption(option =>
            option.setName('elemento')
                .setDescription('Selecciona el elemento del spot')
                .setRequired(true)
                .addChoices(
                    { name: '🔥 Fuego', value: 'fuego' },
                    { name: '💧 Agua', value: 'agua' },
                    { name: '🌱 Tierra', value: 'tierra' },
                    { name: '🌪️ Viento', value: 'viento' }
                ))
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Selecciona el tipo de spot')
                .setRequired(true)
                .addChoices(
                    { name: '⚔️ Main', value: 'main' },
                    { name: '⚔️ Sub Main', value: 'sub' },
                )),

    async execute(interaction) {
        const mapa = interaction.options.getString('mapa');
        const elemento = interaction.options.getString('elemento');
        const tipo = interaction.options.getString('tipo');

        // 🔎 Generar nombre de archivo
        const fileName = `${mapa}${elemento}${tipo}.png`; // ej: lorenciatierraeasy.png
        const filePath = path.join(__dirname, '../data', fileName);

        let embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('📍 Información de Spot - Mu GP')
            .addFields(
                { name: 'Mapa', value: mapa, inline: true },
                { name: 'Elemento', value: elemento, inline: true },
                { name: 'Tipo', value: tipo, inline: true }
            )
            .setFooter({ text: 'Powerd by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        if (fs.existsSync(filePath)) {
            const attachment = new AttachmentBuilder(filePath);
            embed.setImage(`attachment://${fileName}`);
            await interaction.reply({ embeds: [embed], files: [attachment] });
        } else {
            embed.addFields({ name: '⚠️ Imagen', value: 'No se encontró ninguna imagen para este spot.' });
            await interaction.reply({ embeds: [embed] });
        }
    },
};
