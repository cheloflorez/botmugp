const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Estas arrays deben estar cargadas con los valores reales
const { nExp,mExp,masterExp } = require("../../data/data.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculadoratiempo')
        .setDescription('Calcula el tiempo estimado para alcanzar un nivel deseado en Mu Online')
        .addIntegerOption(option =>
            option.setName('nivel_inicial')
                .setDescription('Tu nivel actual')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('nivel_deseado')
                .setDescription('Nivel que deseas alcanzar')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('exp')
                .setDescription('Experiencia por segundo')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('porcentaje')
                .setDescription('Porcentaje actual de la barra (0-100)')
                .setRequired(true)),

    async execute(interaction) {
        const alevel = interaction.options.getInteger('nivel_inicial');
        const flevel = interaction.options.getInteger('nivel_deseado');
        const ex = interaction.options.getInteger('exp');
        const barra = interaction.options.getInteger('porcentaje');

        let resultado, dias, horas, minutos;

        function Calculo() {
            const t = alevel;
            const n = flevel;
            const o = parseInt(ex);
            const a = parseInt(barra);

            function getExpByBar() {
                const exporc = masterExp[t - 400];
                return exporc * (a / 100);
            }

            if (t < 400) {
                const exptotal = nExp[n - 1] - nExp[t];
                let tiempo = exptotal / o;

                if (n > 400) {
                    const expnorm = nExp[399] - nExp[t];
                    const tiemponormal = expnorm / o;
                    const expmaster = mExp[n - 401];
                    const tiempototal = (expmaster / o) + tiemponormal;

                    const A = Math.floor(tiempototal / 3600),
                        y = Math.floor(A / 24),
                        G = Math.floor(A % 24),
                        V = Math.floor(tiempototal % 3600 / 60);

                    dias = y;
                    horas = G;
                    minutos = V;
                } else {
                    const A = Math.floor(tiempo / 3600),
                        y = Math.floor(A / 24),
                        G = Math.floor(A % 24),
                        V = Math.floor(tiempo % 3600 / 60);

                    dias = y;
                    horas = G;
                    minutos = V;
                }
            } else {
                const restp = getExpByBar();
                const expmaster = mExp[n - 401] - mExp[t - 401];
                let tiempo = (expmaster - restp) / o;

                const A = Math.floor(tiempo / 3600),
                    y = Math.floor(A / 24),
                    G = Math.floor(A % 24),
                    V = Math.floor(tiempo % 3600 / 60);

                dias = y;
                horas = G;
                minutos = V;
            }
        }

        // Validaciones
        if (!alevel || !flevel || !ex) {
            resultado = "❌ Complete todos los campos.";
        } else if (alevel >= flevel) {
            resultado = "❌ El nivel inicial no puede ser mayor o igual al nivel deseado.";
        } else if (flevel > 1700) {
            resultado = "❌ El nivel máximo permitido es 1700.";
        } else {
            Calculo();
            resultado = `✅ Para subir del nivel **${alevel}** al nivel **${flevel}** tardarás aproximadamente:\n\`\`\`diff\n+ ${dias} días, ${horas} horas, ${minutos} minutos\n\`\`\``;
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('⏳ Calculadora de Tiempo - Mu Online')
            .setDescription(resultado)
            .addFields(
                { name: 'Nivel inicial', value: `${alevel}`, inline: true },
                { name: 'Nivel deseado', value: `${flevel}`, inline: true },
                { name: 'Experiencia/segundo', value: `${ex}`, inline: true },
                { name: 'Porcentaje inicial', value: `${barra}%`, inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
