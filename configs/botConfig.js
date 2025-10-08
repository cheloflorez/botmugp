/**
 * 🎛️ Configuración centralizada del bot
 * Cambia estos valores según tus necesidades
 */

module.exports = {
    // ⏱️ Intervalos de tiempo
    intervals: {
        bossUpdate: 30 * 1000,              // 30 segundos - actualizar panel de bosses
        healthCheck: 5 * 60 * 1000,         // 5 minutos - verificar salud del bot
        statusLog: 60 * 60 * 1000,          // 1 hora - mostrar estadísticas en consola
        logFlush: 5 * 60 * 1000,            // 5 minutos - enviar logs acumulados
    },

    // 🔔 Alertas de bosses
    bossAlerts: {
        warningMinutes: 5,                  // Avisar cuando falten 5 minutos
        minWarningMinutes: 4,               // Mínimo para evitar spam
    },

    // 💾 Configuración de memoria
    memory: {
        // IMPORTANTE: Estos valores ahora se comparan contra RSS (memoria total real)
        warningThresholdPercent: 85,        // % del límite para advertencia (85% de 512MB = 435MB)
        criticalThresholdPercent: 95,       // % del límite para crítico (95% de 512MB = 486MB)
        maxMemoryMB : 200,
    },

    // 🌐 Umbrales de conexión
    connection: {
        pingWarning: 300,                   // ms - advertir si ping > 300ms
        pingCritical: 1000,                 // ms - crítico si ping > 1000ms
    },

    // 🔄 Gestión de errores
    errorHandling: {
        maxConsecutiveErrors: 10,           // Errores antes de acción crítica
    },

    // 🎮 Configuración de Discord
    discord: {
        presence: {
            activity: "a la prima de Nilton",
            type: 3,                        // 0=Playing, 1=Streaming, 2=Listening, 3=Watching
            status: "online"                // online, idle, dnd, invisible
        },
        autoDeleteReplySeconds: 60,         // Segundos antes de borrar respuestas ephemeral
    },
};

/**
 * 📌 Notas sobre Memoria:
 * 
 * CAMBIO IMPORTANTE: Ahora usamos RSS (Resident Set Size) en lugar de heap%
 * 
 * ¿Por qué?
 * - RSS es la memoria REAL que usa tu bot (todo incluido)
 * - Heap% es engañoso porque el heap total es dinámico
 * - Un heap de 85% no significa que estés usando mucha RAM
 * 
 * Ejemplo con tus valores:
 * - RSS: 59.54MB (memoria real usada) ✅ MUY BIEN
 * - Heap: 16.65/19.63MB (85%) ⚠️ Parece alto pero NO LO ES
 * 
 * Configuración actual:
 * memory.maxMemoryMB = 512
 * - Si RSS llega a 512MB * 0.85 = 435MB → Advertencia
 * - Si RSS llega a 512MB * 0.95 = 486MB → Crítico
 * 
 * Con 60MB de RSS estás usando solo el 11.7% del límite. ¡Perfecto!
 * 
 * ¿Cómo ajustar según tu servidor?
 * - VPS pequeño (512MB RAM total): maxMemoryMB = 256
 * - VPS mediano (1GB RAM total): maxMemoryMB = 512 (actual)
 * - VPS grande (2GB+ RAM total): maxMemoryMB = 1024
 */