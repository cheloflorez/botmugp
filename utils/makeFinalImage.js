// utils/makeFinalImage.js
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');

async function makeFinalImage(direction, idx) {
    const basePath = `./data/mazehelper/${direction}/${idx}finalA.png`;
    const secondPath = `./data/mazehelper/${direction}/${idx}finalB.png`;

    if (!fs.existsSync(basePath)) return null;

    const gap = 20; // gap más grande
    const borderWidth = 2; // borde más fino

    // Cargar imagen principal
    const img1 = await loadImage(basePath);

    // Caso 2: solo una imagen
    if (!fs.existsSync(secondPath)) {
        const canvas = createCanvas(img1.width + gap * 2, img1.height + gap * 2);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#1e1e2f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img1, gap, gap, img1.width, img1.height);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(gap, gap, img1.width, img1.height);

        return new AttachmentBuilder(canvas.toBuffer(), { name: 'final.png' });
    }

    // Caso 3: dos imágenes
    const img2 = await loadImage(secondPath);

    const width = img1.width;
    const height = img1.height;

    const canvas = createCanvas(width * 2 + gap * 3, height + gap * 2);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e1e2f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Imagen 1
    ctx.drawImage(img1, gap, gap, width, height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(gap, gap, width, height);

    // Imagen 2
    ctx.drawImage(img2, width + gap * 2, gap, width, height);
    ctx.strokeRect(width + gap * 2, gap, width, height);

    return new AttachmentBuilder(canvas.toBuffer(), { name: 'final.png' });
}

module.exports = { makeFinalImage };
