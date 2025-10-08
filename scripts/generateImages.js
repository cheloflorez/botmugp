const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const mazeConfig = {
    up: 4,
    down: 9,
    left: 5,
    right: 10
};

// Crear carpeta scripts si no existe
if (!fs.existsSync(path.join(__dirname, '..', 'scripts'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'scripts'));
}

async function generateCollage(direction) {
    try {
        const count = mazeConfig[direction];
        console.log(`  📝 Cargando ${count} imágenes para collage...`);
        
        const imgs = await Promise.all(
            Array.from({ length: count }).map((_, idx) =>
                loadImage(path.join(__dirname, '..', 'data', 'mazehelper', direction, `${idx + 1}.png`))
            )
        );

        const width = imgs[0].width;
        const height = imgs[0].height;
        const gap = 10;
        const cols = 2;
        const rows = Math.ceil(count / cols);

        console.log(`  🎨 Creando canvas: ${cols * width + (cols + 1) * gap}x${rows * height + (rows + 1) * gap}`);

        const canvas = createCanvas(
            cols * width + (cols + 1) * gap, 
            rows * height + (rows + 1) * gap
        );
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

        const outputPath = path.join(__dirname, '..', 'data', 'mazehelper', `${direction}_collage.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        const sizeKB = Math.round(buffer.length / 1024);
        console.log(`  ✅ Generado: ${direction}_collage.png (${sizeKB}KB)`);
        
        return true;
    } catch (error) {
        console.error(`  ❌ Error generando collage ${direction}:`, error.message);
        return false;
    }
}

async function generateFinalImages(direction) {
    const count = mazeConfig[direction];
    let generated = 0;
    let skipped = 0;
    
    for (let idx = 1; idx <= count; idx++) {
        try {
            const basePath = path.join(__dirname, '..', 'data', 'mazehelper', direction, `${idx}finalA.png`);
            const secondPath = path.join(__dirname, '..', 'data', 'mazehelper', direction, `${idx}finalB.png`);
            
            if (!fs.existsSync(basePath)) {
                console.log(`  ⏭️  Saltando ${direction}_${idx}: No existe finalA`);
                skipped++;
                continue;
            }

            const img1 = await loadImage(basePath);
            const gap = 20;
            const borderWidth = 2;

            // Caso 1: Solo una imagen
            if (!fs.existsSync(secondPath)) {
                const canvas = createCanvas(
                    img1.width + gap * 2, 
                    img1.height + gap * 2
                );
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#1e1e2f';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img1, gap, gap, img1.width, img1.height);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = borderWidth;
                ctx.strokeRect(gap, gap, img1.width, img1.height);

                const outputPath = path.join(__dirname, '..', 'data', 'mazehelper', `${direction}_${idx}_final.png`);
                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync(outputPath, buffer);
                
                const sizeKB = Math.round(buffer.length / 1024);
                console.log(`  ✅ ${direction}_${idx}_final.png (${sizeKB}KB)`);
                generated++;
            } 
            // Caso 2: Dos imágenes
            else {
                const img2 = await loadImage(secondPath);
                const width = img1.width;
                const height = img1.height;

                const canvas = createCanvas(
                    width * 2 + gap * 3, 
                    height + gap * 2
                );
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

                const outputPath = path.join(__dirname, '..', 'data', 'mazehelper', `${direction}_${idx}_final.png`);
                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync(outputPath, buffer);
                
                const sizeKB = Math.round(buffer.length / 1024);
                console.log(`  ✅ ${direction}_${idx}_final.png (doble) (${sizeKB}KB)`);
                generated++;
            }
        } catch (error) {
            console.error(`  ❌ Error en ${direction}_${idx}:`, error.message);
        }
    }
    
    console.log(`  📊 Generadas: ${generated}, Saltadas: ${skipped}`);
    return generated;
}

async function generateAll() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  🎨 Generador de Imágenes Pre-cargadas ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    let totalGenerated = 0;
    const startTime = Date.now();
    
    for (const direction of Object.keys(mazeConfig)) {
        console.log(`\n📂 Procesando dirección: ${direction.toUpperCase()}`);
        console.log('═'.repeat(40));
        
        // Generar collage
        const collageSuccess = await generateCollage(direction);
        if (collageSuccess) totalGenerated++;
        
        // Generar imágenes finales
        const finalsGenerated = await generateFinalImages(direction);
        totalGenerated += finalsGenerated;
        
        console.log('');
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         ✅ PROCESO COMPLETADO          ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n📊 Estadísticas:`);
    console.log(`   • Imágenes generadas: ${totalGenerated}`);
    console.log(`   • Tiempo total: ${duration}s`);
    
    // Calcular tamaño total
    const outputDir = path.join(__dirname, '..', 'data', 'mazehelper');
    const files = fs.readdirSync(outputDir).filter(f => 
        f.endsWith('_collage.png') || f.endsWith('_final.png')
    );
    
    let totalSize = 0;
    files.forEach(file => {
        const stat = fs.statSync(path.join(outputDir, file));
        totalSize += stat.size;
    });
    
    console.log(`   • Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   • Archivos generados: ${files.length}`);
    
    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Verificar las imágenes en data/mazehelper/');
    console.log('   2. Actualizar el código del bot (usar versión sin Canvas)');
    console.log('   3. Opcionalmente, eliminar carpetas up/, down/, left/, right/');
    console.log('   4. Opcionalmente, desinstalar canvas: npm uninstall canvas');
    console.log('\n✨ ¡Listo para producción ultra-optimizada!\n');
}

// Verificar que existan las carpetas originales
console.log('🔍 Verificando estructura de archivos...\n');

let missingDirs = [];
for (const dir of Object.keys(mazeConfig)) {
    const dirPath = path.join(__dirname, '..', 'data', 'mazehelper', dir);
    if (!fs.existsSync(dirPath)) {
        missingDirs.push(dir);
    }
}

if (missingDirs.length > 0) {
    console.error('❌ Error: Faltan las siguientes carpetas:');
    missingDirs.forEach(dir => console.error(`   • data/mazehelper/${dir}/`));
    console.error('\nAsegúrate de tener la estructura correcta de archivos.');
    process.exit(1);
}

console.log('✅ Estructura de archivos correcta.\n');

// Ejecutar
generateAll().catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
});