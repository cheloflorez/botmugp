const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder , MessageFlags } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { makeFinalImage } = require('../utils/makeFinalImage');

// Config de direcciones y cantidad de imágenes
const mazeConfig = {
    up: 4,
    down: 9,
    left: 5,
    right: 10
};

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

// ------------------ COLLAGE ------------------
async function makeCollage(direction) {
    const count = mazeConfig[direction];
    if (!count) return null;

    const imgs = await Promise.all(
        Array.from({ length: count }).map((_, idx) =>
            loadImage(`./data/mazehelper/${direction}/${idx + 1}.png`)
        )
    );

    const width = imgs[0].width;
    const height = imgs[0].height;
    const gap = 10;
    const cols = 2;
    const rows = Math.ceil(count / cols);

    const canvas = createCanvas(cols * width + (cols + 1) * gap, rows * height + (rows + 1) * gap);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e1e2f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 28px Sans';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    imgs.forEach((img, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = gap + col * (width + gap);
        const y = gap + row * (height + gap);

        ctx.drawImage(img, x, y, width, height);

        const num = `${idx + 1}`;
        ctx.strokeText(num, x + 10, y + 30);
        ctx.fillText(num, x + 10, y + 30);
    });

    return new AttachmentBuilder(canvas.toBuffer(), { name: 'collage.png' });
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
}

async function handleDirection(interaction, direction) {
    const file = await makeCollage(direction);
    if (!file) return interaction.reply({ content: '⚠️ No se encontraron imágenes para esta dirección.', flags: MessageFlags.Ephemeral });

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📂 ${direction.toUpperCase()} - Selecciona una imagen`)
        .setImage('attachment://collage.png');

    await interaction.update({
        embeds: [embed],
        files: [file],
        components: [makeNumberRow(direction), makeBackRow()]
    });
}

async function handleImage(interaction, direction, idx) {
    const finalFile = await makeFinalImage(direction, idx);
    if (!finalFile) return interaction.reply({ content: '⚠️ No se encontró la imagen final.', flags: MessageFlags.Ephemeral });

    const secondPath = `./data/mazehelper/${direction}/${idx}finalB.png`;
    const description = fs.existsSync(secondPath)
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
}

async function handleBack(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🌀 Maze of Dimensions Helper')
        .setDescription('Elige una dirección para comenzar')
        .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.update({ embeds: [embed], components: [makeDirectionRow()], files: [] });
}

async function handleBackSub(interaction, direction) {
    const file = await makeCollage(direction);
    if (!file) return interaction.reply({ content: '⚠️ No se encontraron imágenes.', flags: MessageFlags.Ephemeral });

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📂 ${direction.toUpperCase()} - Selecciona una imagen`)
        .setImage('attachment://collage.png');

    await interaction.update({
        embeds: [embed],
        files: [file],
        components: [makeNumberRow(direction), makeBackRow()]
    });
}


// ------------------ EXPORTS ------------------
module.exports = {
    handleInteraction,
    handleDirection,
    handleImage,
    handleBack,
    handleBackSub,
};
