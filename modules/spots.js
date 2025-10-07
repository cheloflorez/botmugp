const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const fs = require('fs').promises;
const fsSync = require('fs'); // Para existsSync que no tiene versión async
const path = require('path');

const spotSelections = new Map();

// Cache para configuración
let configCache = null;
let configLastLoad = 0;
const CONFIG_TTL = 60000;

// Limpiar selecciones viejas cada 5 minutos
setInterval(() => {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutos
    
    for (const [userId, data] of spotSelections.entries()) {
        if (!data.timestamp || (now - data.timestamp) > maxAge) {
            spotSelections.delete(userId);
        }
    }
}, 5 * 60 * 1000);

// Leer configuración ASÍNCRONA con caché
async function readSpotConfig() {
    const now = Date.now();
    if (configCache && (now - configLastLoad) < CONFIG_TTL) {
        return configCache;
    }

    const configPath = path.join(__dirname, '..', 'data', 'spots', 'spotsConfig.json');
    try {
        const raw = await fs.readFile(configPath, 'utf8');
        configCache = JSON.parse(raw);
        configLastLoad = now;
        return configCache;
    } catch (error) {
        console.error('Error reading spot config:', error);
        // Retornar configuración por defecto si no existe el archivo
        return {
            SOD: { main: 9, sub: 7 },
            ARENA: { main: 7, sub: 6 },
            KANTURU: { main: 7, sub: 6 }
            // Agrega más mapas aquí según necesites
        };
    }
}

// Obtener nombres de mapas ASÍNCRONO
async function getMapas() {
    const config = await readSpotConfig();
    return Object.keys(config);
}

// ------------------ MENÚ INICIAL ------------------
async function handleInteraction(interaction) {
    const mapas = await getMapas();
    if (mapas.length === 0) {
        return interaction.reply({ content: '❌ No hay mapas configurados.', flags: MessageFlags.Ephemeral });
    }

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

    // Verificar si existe el archivo (usando fsSync porque no hay versión async de existsSync)
    const fileExists = fsSync.existsSync(filePath);
    if (!fileExists) {
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

    // Obtener configuración del mapa desde el caché/archivo
    const config = await readSpotConfig();
    const mapaKey = selectedMapa.toUpperCase();
    const { main = 7, sub = 6 } = config[mapaKey] || { main: 7, sub: 6 };

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
    // Usar la función getMapas que ya es asíncrona
    const mapas = await getMapas();

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

    await interaction.update({ embeds: [embed], components: [row1, row2, row3], files: [] });
}

// ------------------ SELECT MENUS ------------------
function handleSelect(interaction) {
    let userData = spotSelections.get(interaction.user.id) || {};
    userData.timestamp = Date.now(); // Agregar timestamp para TTL
    
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