const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const spotSelections = new Map(); // key: userId, value: { mapa, elemento }

<<<<<<< HEAD
// ------------------ MENÚ INICIAL ------------------
async function handleInteraction(interaction) {
    const dataPath = path.join(__dirname, '..', 'data', 'spots');
    const mapas = fs.readdirSync(dataPath).filter(file => fs.lstatSync(path.join(dataPath, file)).isDirectory());

    if (mapas.length === 0) return interaction.reply({ content: '❌ No hay mapas disponibles.', flags: MessageFlags.Ephemeral });

=======
// Leer configuración
const configPath = path.join(__dirname, '..', 'data', 'spots', 'spotsConfig.json');
function readSpotConfig() {
    if (!fs.existsSync(configPath)) return {};
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
}

// Obtener nombres de mapas
function getMapas() {
    const config = readSpotConfig();
    return Object.keys(config); // ["SOD", "ARENA", "KANTURU"]
}

// ------------------ MENÚ INICIAL ------------------
async function handleInteraction(interaction) {
    const mapas = getMapas();
    if (mapas.length === 0) {
        return interaction.reply({ content: '❌ No hay mapas configurados.', flags: 64 });
    }
>>>>>>> fca0e5e8a30619c65371730de35066af4eda9186
    const mapaSelect = new StringSelectMenuBuilder()
        .setCustomId('select_mapa')
        .setPlaceholder('Selecciona un mapa')
        .addOptions(mapas.map(m => ({ label: m, value: m })));

    const elementoSelect = new StringSelectMenuBuilder()
        .setCustomId('select_elemento')
        .setPlaceholder('Selecciona un elemento')
        .addOptions([
            { label: '🌍 Tierra', value: 'Tierra' },
            { label: '💧 Agua', value: 'Agua' },
            { label: '🔥 Fuego', value: 'Fuego' },
            { label: '🌑 Oscuridad', value: 'Oscuridad' },
            { label: '🌪️ Viento', value: 'Viento' },
        ]);

    const buscarButton = new ButtonBuilder()
        .setCustomId('buscar_spot')
        .setLabel('🔍 Buscar')
        .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(mapaSelect);
    const row2 = new ActionRowBuilder().addComponents(elementoSelect);
    const row3 = new ActionRowBuilder().addComponents(buscarButton);

    const embed = new EmbedBuilder()
        .setColor(0x00FF7F)
        .setTitle('🎯 Módulo Spots')
        .setDescription('Selecciona un mapa y un elemento, luego presiona **Buscar**.')
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed], components: [row1, row2, row3], flags: MessageFlags.Ephemeral });
}

// ------------------ BOTÓN BUSCAR ------------------
async function handleSearch(interaction, selectedMapa, selectedElemento) {
    const filePath = path.join(__dirname, '..', 'data', 'spots', selectedMapa, `${selectedElemento}.png`);

    if (!fs.existsSync(filePath)) {
        return interaction.update({
            content: `❌ No se encontró la imagen para ${selectedMapa} - ${selectedElemento}`,
            components: [],
            embeds: []
        });
    }

    const volverButton = new ButtonBuilder()
        .setCustomId('volver_spots')
        .setLabel('⬅️ Volver')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(volverButton);

    // 📌 Diccionario de configuraciones especiales
<<<<<<< HEAD
    const spotConfig = {
        default: { main: 7, sub: 6 },
        SOD: { main: 9, sub: 7 },
        // 🔮 Podés agregar más mapas acá
        // ARENA: { main: 8, sub: 5 },
        // KANTURU: { main: 10, sub: 8 },
    };

    // 👇 Buscar configuración según el mapa (case-insensitive)
    const mapaKey = selectedMapa.toUpperCase();
    const { main, sub } = spotConfig[mapaKey] || spotConfig.default;
=======
    function spotConfig(mapa) {
        const filePath = path.join(__dirname, '..', 'data', 'spots', 'spotsConfig.json');
        let config = {};

        if (fs.existsSync(filePath)) {
            config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        return config[mapa.toUpperCase()] || { main: 7, sub: 6 }; // valores por defecto
    }

    // 👇 Buscar configuración según el mapa (case-insensitive)
    const { main, sub } = spotConfig(selectedMapa);
>>>>>>> fca0e5e8a30619c65371730de35066af4eda9186

    const embed = new EmbedBuilder()
        .setColor(0x00FF7F)
        .setTitle(`🎯 Spots - ${selectedMapa} (${selectedElemento})`)
        .setDescription(
            `🟢 **Spots marcados:**\n` +
            `- <:bless:1414809839493714050> *Jewel of Bless*: **Main Spot** (${main} mobs)\n` +
            `- <:soul:1414809841066573896> *Jewel of Soul*: **Sub Spot** (${sub} mobs)`
        )
        .setImage(`attachment://${selectedElemento}.png`)
        .setFooter({
            text: 'Powered by Chelo',
            iconURL: interaction.client.user.displayAvatarURL()
        });

    await interaction.update({
        embeds: [embed],
        components: [row],
        files: [{ attachment: filePath, name: `${selectedElemento}.png` }]
    });
}


// ------------------ BOTÓN VOLVER ------------------
async function handleBack(interaction) {
<<<<<<< HEAD
    const dataPath = path.join(__dirname, '..', 'data', 'spots');
    const mapas = fs.readdirSync(dataPath).filter(file => fs.lstatSync(path.join(dataPath, file)).isDirectory());
=======
    const mapas = getMapas();
>>>>>>> fca0e5e8a30619c65371730de35066af4eda9186

    const mapaSelect = new StringSelectMenuBuilder()
        .setCustomId('select_mapa')
        .setPlaceholder('Selecciona un mapa')
        .addOptions(mapas.map(m => ({ label: m, value: m })));

    const elementoSelect = new StringSelectMenuBuilder()
        .setCustomId('select_elemento')
        .setPlaceholder('Selecciona un elemento')
        .addOptions([
            { label: '🌍 Tierra', value: 'Tierra' },
            { label: '💧 Agua', value: 'Agua' },
            { label: '🔥 Fuego', value: 'Fuego' },
            { label: '🌑 Oscuridad', value: 'Oscuridad' },
            { label: '🌪️ Viento', value: 'Viento' },
        ]);

    const buscarButton = new ButtonBuilder()
        .setCustomId('buscar_spot')
        .setLabel('🔍 Buscar')
        .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(mapaSelect);
    const row2 = new ActionRowBuilder().addComponents(elementoSelect);
    const row3 = new ActionRowBuilder().addComponents(buscarButton);

    const embed = new EmbedBuilder()
        .setColor(0x00FF7F)
        .setTitle('🎯 Módulo Spots')
        .setDescription('Selecciona un mapa y un elemento, luego presiona **Buscar**.')
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

    // Aquí quitamos cualquier imagen previa
    await interaction.update({ embeds: [embed], components: [row1, row2, row3], files: [] });
}

// ------------------ SELECT MENUS ------------------
function handleSelect(interaction) {
    let userData = spotSelections.get(interaction.user.id) || {};
    if (interaction.customId === 'select_mapa') userData.mapa = interaction.values[0];
    if (interaction.customId === 'select_elemento') userData.elemento = interaction.values[0];
    spotSelections.set(interaction.user.id, userData);
    interaction.deferUpdate();
}

// ------------------ AYUDAS ------------------
function getUserSelection(userId) {
    return spotSelections.get(userId) || {};
}

function clearUserSelection(userId) {
    spotSelections.delete(userId);
}


// ------------------ EXPORTS ------------------
module.exports = {
    handleInteraction,
    handleSearch,
    handleBack,
    handleSelect,
    getUserSelection,
    clearUserSelection,
};
