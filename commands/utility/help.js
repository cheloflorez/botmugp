const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la lista de comandos disponibles'),

    async execute(interaction) {
        // Embed principal
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('🤖 Ayuda - AlmaBOT')
            .setDescription('Selecciona una categoría para ver los comandos disponibles:')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        // Botones de categorías
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('calculadoras')
                .setLabel('🧮 Calculadoras')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('guias')
                .setLabel('📚 Guías')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('cerrar')
                .setLabel('❌ Cerrar')
                .setStyle(ButtonStyle.Danger)
        );

        // Responder con el embed + botones
        await interaction.reply({ embeds: [embed], components: [row] , instead : true });

        // Crear collector para manejar clicks en botones
        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000 // 1 min
        });

        collector.on('collect', async i => {
            if (i.customId === 'calculadoras') {
                const calcEmbed = new EmbedBuilder()
                    .setColor(0x2ECC71)
                    .setTitle('🧮 Comandos de Calculadoras')
                    .addFields(
                        {
                            name: '/calculadoranivel',
                            value: 'Calcula el nivel que puedes alcanzar según el tiempo jugado.\n' +
                                '```/calculadoranivel nivel:350 dias:3 horas:5 minutos:30 exp:20 porcentaje:50```'
                        },
                        {
                            name: '/calculadoratiempo',
                            value: 'Calcula cuánto tiempo tardarás en llegar a un nivel deseado.\n' +
                                '```/calculadoratiempo nivel_inicial:350 nivel_deseado:500 exp:20 barra:30```'
                        }
                    )
                    .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

                await i.update({ embeds: [calcEmbed], components: [row] });
            }

            if (i.customId === 'guias') {
                const guiasEmbed = new EmbedBuilder()
                    .setColor(0xF1C40F)
                    .setTitle('📚 Comandos de Guías')
                    .addFields(
                        {
                            name: '/guias',
                            value: 'Muestra el enlace a todas las guías de Mu Online.\n' +
                                '```/guias```'
                        }
                    )
                    .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

                await i.update({ embeds: [guiasEmbed], components: [row] });
            }

            if (i.customId === 'cerrar') {
                await i.update({ content: '❌ Menú de ayuda cerrado.', embeds: [], components: [] });
                collector.stop();
            }
        });

        collector.on('end', async () => {
            try {
                await interaction.editReply({ components: [] });
            } catch (err) {
                // Si ya fue cerrado, no hace nada
            }
        });
    },
};
