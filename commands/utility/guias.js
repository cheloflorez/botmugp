const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guias')
		.setDescription('Muestra las guías de Mu Online'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0xFFD700) // dorado gamer
			.setTitle('📚 Guías de Mu Online')
			.setDescription('Encuentra todas las guías y tutoriales en el siguiente enlace:')
			.setURL('https://almacengamertv.com/muonline/')
			.addFields(
				{ name: '🌐 Sitio oficial', value: '[Haz clic aquí](https://almacengamertv.com/muonline/)' }
			)
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};