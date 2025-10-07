const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField , MessageFlags } = require('discord.js');
const { getStats } = require('../modules/logs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Muestra estadísticas de uso del bot (solo admins)'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Solo los administradores pueden usar este comando.', ephemeral: true });
        }
        const stats =  getStats();
        const embed = new EmbedBuilder()
            .setColor(0x1abc9c)
            .setTitle('📊 Estadísticas del Bot')
            .addFields(
                { name: 'Módulos más usados', value: Object.entries(stats.byAction).map(([k,v]) => `${k}: ${v}`).join('\n') || 'Ninguno', inline: false },
                { name: 'Usuarios más activos', value: Object.entries(stats.byUser).map(([k,v]) => `${k}: ${v}`).join('\n') || 'Ninguno', inline: false }
            )
            .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};