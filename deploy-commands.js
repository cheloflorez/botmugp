const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./configs/config');

/**
 * Carga todos los comandos desde la carpeta /commands
 * @returns {Array} Array de comandos en formato JSON
 */
function loadCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    
    // Verificar que existe la carpeta
    if (!fs.existsSync(commandsPath)) {
        console.warn('⚠️  La carpeta /commands no existe. Creándola...');
        fs.mkdirSync(commandsPath);
        return commands;
    }
    
    // Leer todos los archivos .js
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    if (commandFiles.length === 0) {
        console.warn('⚠️  No se encontraron comandos en /commands');
        return commands;
    }
    
    console.log(`📂 Encontrados ${commandFiles.length} archivo(s) de comandos\n`);
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        
        try {
            const command = require(filePath);
            
            // Verificar que el comando tenga la estructura correcta
            if (!command.data) {
                console.error(`❌ ${file}: Falta la propiedad 'data'`);
                continue;
            }
            
            // Convertir a JSON si es necesario
            let commandData;
            if (typeof command.data.toJSON === 'function') {
                commandData = command.data.toJSON();
            } else if (typeof command.data === 'object') {
                commandData = command.data;
            } else {
                console.error(`❌ ${file}: 'data' no es un objeto válido`);
                continue;
            }
            
            commands.push(commandData);
            console.log(`✅ ${file} → /${commandData.name} - ${commandData.description}`);
            
        } catch (error) {
            console.error(`❌ Error cargando ${file}:`, error.message);
        }
    }
    
    return commands;
}

/**
 * Registra los comandos en Discord
 */
async function deployCommands() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     🚀 Deploy de Comandos Discord      ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    // Cargar comandos
    const commands = loadCommands();
    
    if (commands.length === 0) {
        console.error('\n❌ No hay comandos para registrar. Proceso cancelado.');
        process.exit(1);
    }
    
    console.log(`\n📊 Total de comandos a registrar: ${commands.length}`);
    console.log('═'.repeat(40));
    
    // Crear cliente REST
    const rest = new REST({ version: '10' }).setToken(config.discord.token);
    
    try {
        console.log('\n🔄 Iniciando registro de comandos...');
        
        // Registrar comandos en el servidor específico (más rápido)
        const data = await rest.put(
            Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
            { body: commands }
        );
        
        console.log(`\n✅ ¡Comandos registrados exitosamente!`);
        console.log(`   • Comandos registrados: ${data.length}`);
        console.log(`   • Servidor ID: ${config.discord.guildId}`);
        
        console.log('\n📋 Comandos disponibles:');
        commands.forEach((cmd, index) => {
            console.log(`   ${index + 1}. /${cmd.name} - ${cmd.description}`);
        });
        
        console.log('\n✨ Los comandos deberían estar disponibles inmediatamente en Discord.');
        console.log('   Si no aparecen, espera hasta 1 minuto o reinicia Discord.\n');
        
    } catch (error) {
        console.error('\n❌ Error al registrar comandos:', error);
        
        if (error.code === 50001) {
            console.error('\n💡 Error: El bot no tiene acceso al servidor.');
            console.error('   Verifica que el bot esté invitado al servidor con el ID correcto.');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n💡 Error: No se pudo conectar a Discord.');
            console.error('   Verifica tu conexión a internet.');
        } else if (error.rawError?.message?.includes('token')) {
            console.error('\n💡 Error: Token inválido.');
            console.error('   Verifica el DISCORD_TOKEN en tu archivo .env');
        }
        
        process.exit(1);
    }
}

// Ejecutar
deployCommands();