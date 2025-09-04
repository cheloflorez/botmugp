const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Estas arrays deberían estar cargadas con los valores reales del Mu Online
const { nExp,mExp,exp,masterExp } = require("../../data/data.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculadoranivel')
        .setDescription('Calcula el nivel que se puede alcanzar en Mu Online')
        .addIntegerOption(option =>
            option.setName('nivel')
                .setDescription('Tu nivel actual')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('dias')
                .setDescription('Días de leveo')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('horas')
                .setDescription('Horas por día')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('minutos')
                .setDescription('Minutos extra')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('exp')
                .setDescription('Experiencia por segundo')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('porcentaje')
                .setDescription('Porcentaje de la barra actual (0-100)')
                .setRequired(true)),

    async execute(interaction) {
        const alevel = interaction.options.getInteger('nivel');
        const days = interaction.options.getInteger('dias');
        const hours = interaction.options.getInteger('horas');
        const minutes = interaction.options.getInteger('minutos');
        const ex = interaction.options.getInteger('exp');
        const porcent = interaction.options.getInteger('porcentaje');

        function calcularNivel() {
            const t = parseInt(alevel);
            const a = parseInt(days);
            const n = parseInt(hours);
            const o = parseInt(ex);
            const r = parseInt(minutes);
            const por = parseInt(porcent);

            const f = (a * 86400 + (n * 3600) + (r * 60)) * o;

            function getExpByBar() {
                const exporc = masterExp[t - 400];
                return exporc * (por / 100);
            }

            function getExpByBarNor() {
                const exporc = exp[t];
                return exporc * (por / 100);
            }

            if (t <= 400) {
                const restp = getExpByBarNor();
                const exptotal = f + nExp[t] + restp;
                const m = nExp.findIndex(_ => _ > exptotal);

                if (m === -1) {
                    const nuevaexp = f - nExp[399] + restp;
                    const t = mExp.findIndex(_ => _ > nuevaexp);
                    const k = t + 400;

                    if (t === -1) {
                        return `Usted va alcanzar el nivel MAXIMO (1700)`;
                    } else {
                        const resto = (mExp[t] - nuevaexp);
                        const resto2 = masterExp[t];
                        const resto3 = resto2 - resto;
                        const porcentaje = (resto3 * 100) / resto2;
                        return `Usted va alcanzar el nivel ${k} y ${Math.floor(porcentaje)}% del próximo nivel`;
                    }
                } else {
                    const resto = (nExp[m] - exptotal);
                    const resto2 = exp[m];
                    const resto3 = resto2 - resto;
                    const porcentaje = (resto3 * 100) / resto2;
                    return `Usted va alcanzar el nivel ${m} y ${Math.floor(porcentaje)}% del próximo nivel`;
                }
            } else {
                const restp = getExpByBar();
                const exptotal = f + mExp[t - 401] + restp;
                const m = mExp.findIndex(_ => _ > exptotal);

                if (m === -1) {
                    return `Usted va alcanzar el nivel MAXIMO (1700)`;
                } else {
                    const resto = (mExp[m] - exptotal);
                    const resto2 = masterExp[m];
                    const resto3 = resto2 - resto;
                    const porcentaje = (resto3 * 100) / resto2;
                    const k = m + 400;
                    return `Usted va alcanzar el nivel ${k} y ${Math.floor(porcentaje)}% del próximo nivel`;
                }
            }
        }

        const resultado = calcularNivel();

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('⚔️ Calculadora de Nivel - Mu GP & MTM')
            .addFields(
                {
                    name: '✨ Resultado',
                    value: `\`\`\`diff\n+ ${resultado}\n\`\`\``,
                    inline: false
                },
                { name: 'Nivel actual', value: `${alevel}`, inline: true },
                { name: 'Progreso inicial', value: `${porcent}%`, inline: true },
                { name: 'Tiempo de leveo', value: `${days} días, ${hours} horas, ${minutes} minutos`, inline: true },
                { name: 'Experiencia/segundo', value: `${ex}`, inline: true },
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
