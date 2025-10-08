const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const log = require('../utils/logger');
const metrics = require('../utils/metrics');

// Config de direcciones
const mazeConfig = {
    up: 4,
    down: 9,
    left: 5,
    right: 10
};

// Cache simple de archivos leídos (opcional, pero ayuda)
const fileCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

// Limpiar caché
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of fileCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            fileCache.delete(key);
        }
    }
}, CACHE_TTL);

// ------------------ BOTONES ------------------
function makeDirectionRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dir_up').setLabel('⬆️ Arriba').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('dir_down').setLabel('⬇️ Abajo').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('dir_left').setLabel('⬅️ Izquierda').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('dir_right').setLabel('➡️ Derecha').setStyle(ButtonStyle.Primary)
    );
}

function makeBackRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('back_menu').setLabel('🔙 Volver al menú').setStyle(ButtonStyle.Danger)
    );
}

function makeBackSubRow(direction) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`back_sub_${direction}`).setLabel('⬅️ Volver al submenú').setStyle(ButtonStyle.Primary)
    );
}

function makeNumberRow(direction) {
    const count = mazeConfig[direction] || 0;
    const buttons = Array.from({ length: count }).map((_, idx) =>
        new ButtonBuilder()
            .setCustomId(`img_${direction}_${idx + 1}`)
            .setLabel(`${idx + 1}`)
            .setStyle(ButtonStyle.Secondary)
    );

    return new ActionRowBuilder().addComponents(buttons);
}

// ------------------ CARGAR IMAGEN (SIN CANVAS) ------------------
function loadCollage(direction) {
    const filePath = path.join(__dirname, '..', 'data', 'mazehelper', `${direction}_collage.png`);
    
    // Verificar si existe
    if (!fs.existsSync(filePath)) {
        log.warn(`Collage not found: ${filePath}`);
        return null;
    }
    
    // Usar caché si está disponible
    const cached = fileCache.get(filePath);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.attachment;
    }
    
    // Crear attachment
    const attachment = new AttachmentBuilder(filePath, { name: 'collage.png' });
    
    // Guardar en caché
    fileCache.set(filePath, {
        attachment,
        timestamp: Date.now()
    });
    
    return attachment;
}

function loadFinalImage(direction, idx) {
    const filePathA = path.join(__dirname, '..', 'data', 'mazehelper', `${direction}_${idx}_final.png`);
    
    if (!fs.existsSync(filePathA)) {
        log.warn(`Final image not found: ${filePathA}`);
        return null;
    }
    
    return new AttachmentBuilder(filePathA, { name: 'final.png' });
}

function hasMultiplePaths(direction, idx) {
    const filePathB = path.join(__dirname, '..', 'data', 'mazehelper', `${direction}_${idx}_final_B.png`);
    return fs.existsSync(filePathB);
}

// ------------------ HANDLERS ------------------
async function handleInteraction(interaction) {
    
    const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🌀 Maze of Dimensions Helper')
        .setDescription('Elige una dirección para comenzar')
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({
        embeds: [embed],
        components: [makeDirectionRow()],
        flags: MessageFlags.Ephemeral
    });
    
    log.info('MazeHelper opened', { userId: interaction.user.id });
}

async function handleDirection(interaction, direction) {
    const startTime = Date.now();
    
    try {
        const file = loadCollage(direction);
        
        if (!file) {
            return interaction.update({ 
                content: '⚠️ No se encontró el collage para esta dirección.', 
                components: [],
                embeds: []
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`📂 ${direction.toUpperCase()} - Selecciona una imagen`)
            .setImage('attachment://collage.png');

        await interaction.update({
            embeds: [embed],
            files: [file],
            components: [makeNumberRow(direction), makeBackRow()]
        });
        
        const duration = Date.now() - startTime;
        log.info('Direction loaded', { 
            userId: interaction.user.id, 
            direction,
            duration: `${duration}ms`
        });
        
        
    } catch (error) {
        log.error('Error in handleDirection', error);
        
        return interaction.update({ 
            content: '❌ Error al cargar el collage.', 
            components: [],
            embeds: []
        });
    }
}

async function handleImage(interaction, direction, idx) {
    const startTime = Date.now();
    
    try {
        const finalFile = loadFinalImage(direction, idx);
        
        if (!finalFile) {
            return interaction.update({ 
                content: '⚠️ No se encontró la imagen final.', 
                components: [],
                embeds: []
            });
        }

        const hasMultiple = hasMultiplePaths(direction, idx);
        const description = hasMultiple
            ? '⚠️ Hay 2 opciones de caminos, elige una.'
            : 'Camino seleccionado';

        const embed = new EmbedBuilder()
            .setColor(0xe67e22)
            .setTitle(`🖼 Imagen ${idx} (${direction.toUpperCase()})`)
            .setDescription(description)
            .setImage('attachment://final.png');

        await interaction.update({
            embeds: [embed],
            files: [finalFile],
            components: [makeBackSubRow(direction)]
        });
        
        const duration = Date.now() - startTime;
        log.info('Image loaded', { 
            userId: interaction.user.id, 
            direction, 
            idx,
            duration: `${duration}ms`
        });
        
        
    } catch (error) {
        log.error('Error in handleImage', error);
        
        return interaction.update({ 
            content: '❌ Error al cargar la imagen.', 
            components: [],
            embeds: []
        });
    }
}

async function handleBack(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🌀 Maze of Dimensions Helper')
        .setDescription('Elige una dirección para comenzar')
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.update({ 
        embeds: [embed], 
        components: [makeDirectionRow()], 
        files: [] 
    });
}

async function handleBackSub(interaction, direction) {
    try {
        const file = loadCollage(direction);
        
        if (!file) {
            return interaction.update({ 
                content: '⚠️ No se encontró el collage.', 
                components: [],
                embeds: []
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`📂 ${direction.toUpperCase()} - Selecciona una imagen`)
            .setImage('attachment://collage.png');

        await interaction.update({
            embeds: [embed],
            files: [file],
            components: [makeNumberRow(direction), makeBackRow()]
        });
        
    } catch (error) {
        log.error('Error in handleBackSub', error);
        
        return interaction.update({ 
            content: '❌ Error al volver.', 
            components: [],
            embeds: []
        });
    }
}

// ------------------ EXPORTS ------------------
module.exports = {
    handleInteraction,
    handleDirection,
    handleImage,
    handleBack,
    handleBackSub,
};