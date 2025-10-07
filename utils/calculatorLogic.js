const { EmbedBuilder, MessageFlags } = require('discord.js');
const { exp, nExp, masterExp, mExp } = require('../data/data.js');

async function calcular(interaction, { nivel, tiempo, exp: expPorSegundo, porcentaje }) {
    // expPorSegundo ya viene del input "expSegundos"
    const regex = /(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?/i;
    const match = tiempo.match(regex);
    const dias = parseInt(match[1] || 0);
    const horas = parseInt(match[2] || 0);
    const minutos = parseInt(match[3] || 0);

    const t = parseInt(nivel);
    const a = dias;
    const n = horas;
    const r = minutos;
    const expPS = parseInt(expPorSegundo);
    const por = parseFloat(porcentaje);


    // Experiencia ganada
    const expGanada = (a * 86400 + n * 3600 + r * 60) * expPS;

    function getExpByBarNormal() { return exp[t] ? exp[t] * (por / 100) : 0; }
    function getExpByBarMaster() { return masterExp[t - 400] ? masterExp[t - 400] * (por / 100) : 0; }

    let nivelRes, expAnterior, porcentajeNivel, k;
    let exptotal;
    let mensajeResultado = ''; // <-- mensaje que irá en el embed

    if (t < 400) {
        exptotal = (t > 0 ? nExp[t - 1] : 0) + getExpByBarNormal() + expGanada;

        if (exptotal < nExp[nExp.length - 1]) {
            const m = nExp.findIndex(_ => _ > exptotal);
            nivelRes = m !== -1 ? m : nExp.length - 1;
            expAnterior = nivelRes > 0 ? nExp[nivelRes - 1] : 0;
            porcentajeNivel = Math.floor(((exptotal - expAnterior) * 100) / (exp[nivelRes] || 1));
            k = nivelRes;
            mensajeResultado = `Usted va a alcanzar el nivel ${k} y ${porcentajeNivel}% del próximo nivel.`;
        } else {
            // Pasando a Master
            const expMasterRest = exptotal - nExp[nExp.length - 1];
            const m = mExp.findIndex(_ => _ > expMasterRest);
            if (m === -1) {
                // Caso máximo alcanzado
                mensajeResultado = '✅ ¡Usted va alcanzar el nivel máximo (1700)!';
                nivelRes = 1700;
                porcentajeNivel = 100;
                k = 1700;
            } else {
                nivelRes = m;
                expAnterior = nivelRes > 0 ? mExp[nivelRes - 1] : 0;
                porcentajeNivel = Math.floor(((expMasterRest - expAnterior) * 100) / (masterExp[nivelRes] || 1));
                k = nivelRes + 400;
                mensajeResultado = `Usted va a alcanzar el nivel **${k}** y ${porcentajeNivel}% del próximo nivel.`;
            }
        }
    } else {
        // Niveles Master
        exptotal = expGanada + getExpByBarMaster() + (t > 400 ? (mExp[t - 401] || 0) : 0);
        const m = mExp.findIndex(_ => _ > exptotal);
        if (m === -1) {
            mensajeResultado = '✅ ¡Usted va alcanzar el nivel máximo (1700)!';
            nivelRes = 1700;
            porcentajeNivel = 100;
            k = 1700;
        } else {
            nivelRes = m;
            expAnterior = nivelRes > 0 ? mExp[nivelRes - 1] : 0;
            porcentajeNivel = Math.floor(((exptotal - expAnterior) * 100) / (masterExp[nivelRes] || 1));
            k = nivelRes + 400;
            mensajeResultado = `Usted va a alcanzar el nivel ${k} y ${porcentajeNivel}% del próximo nivel.`;
        }
    }

    // --- Embed resultado ---

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('⚔️ Calculadora de Nivel - Mu GP & MTM')
        .setDescription('Datos Ingresados por el usuario :') // Aquí el bloque resalta el mensaje
        .addFields(
            { name: '🎯 Nivel actual', value: `${nivel}`, inline: true },
            { name: '⏳ Progreso inicial', value: `${por}%`, inline: true },
            { name: '🕒 Tiempo de leveo', value: `${dias}d ${horas}h ${minutos}m`, inline: true },
            { name: '⚡ Experiencia/segundo', value: `${expPorSegundo.toLocaleString('es-ES')}`, inline: true },
            {
                name: '✨ Resultado',
                value: `\`\`\` ${mensajeResultado}\n\`\`\``,
                inline: false
            },
        )
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp()
        .setThumbnail(interaction.client.user.displayAvatarURL());


    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

}
async function calcularTime(interaction, { nivel_inicial, nivel_deseado, exp: expSegundos, porcentaje }) {
    // --- Conversión de tipos ---
    const nivelInicial = parseInt(nivel_inicial);
    const nivelDeseado = parseInt(nivel_deseado);
    const ex = parseInt(expSegundos);
    let barra = parseInt(porcentaje);

    // Ajustes automáticos
    if (nivelInicial >= 400 && barra > 99) barra = 99;

    // --- Cálculo del tiempo ---
    function calcularTiempo() {
        const t = nivelInicial;
        const n = nivelDeseado;

        function getExpByBar() {
            return t >= 400 ? masterExp[t - 400] * (barra / 100) : 0;
        }

        let tiempo;

        if (t < 400) {
            if (n <= 400) {
                tiempo = (nExp[n - 1] - nExp[t]) / ex;
            } else {
                const expnorm = nExp[399] - nExp[t]; // hasta nivel 400
                const tiemponormal = expnorm / ex;
                const expmaster = mExp[n - 401]; // master desde 401
                tiempo = tiemponormal + (expmaster / ex);
            }
        } else if (t === 400) {
            tiempo = (mExp[n - 401] - getExpByBar()) / ex;
        } else {
            tiempo = (mExp[n - 401] - mExp[t - 401] - getExpByBar()) / ex;
        }

        const totalHoras = Math.floor(tiempo / 3600);
        const dias = Math.floor(totalHoras / 24);
        const horas = totalHoras % 24;
        const minutos = Math.floor((tiempo % 3600) / 60);

        return { dias, horas, minutos };
    }

    const { dias, horas, minutos } = calcularTiempo();

    // --- Embed resultado ---
    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('⏳ Calculadora de Tiempo - Mu Online')
        .setDescription('Datos Ingresados por el usuario :')
        .addFields(
            { name: '🎯 Nivel inicial', value: `${nivelInicial}`, inline: true },
            { name: '🏁 Nivel deseado', value: `${nivelDeseado}`, inline: true },
            { name: '⚡ Experiencia/segundo', value: `${ex}`, inline: true },
            { name: '⏳ Porcentaje inicial', value: `${barra}%`, inline: true },
            {
                name: '🕒 Tiempo estimado',
                value: `\`\`\` ${dias} Dias ${horas} Horas ${minutos} Minutos\n\`\`\``,
                inline: false
            }

        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

module.exports = { calcular, calcularTime };
