const fs = require('fs');
const path = require('path');

/**
 * 🏥 Health Checker - Monitorea la salud del bot
 */
class HealthChecker {
    constructor(client, options = {}) {
        this.client = client;
        this.lastSuccessfulUpdate = Date.now();
        this.errorCount = 0;

        // Configuración personalizable
        this.config = {
            maxErrors: options.maxErrors || 10,
            checkInterval: options.checkInterval || 5 * 60 * 1000,
            maxMemoryMB: options.maxMemoryMB || 512, // ← Límite total en MB
            memoryWarningThreshold: options.memoryWarningThreshold || 85, // ← % para advertencia
            memoryCriticalThreshold: options.memoryCriticalThreshold || 95, // ← % para crítico
            pingWarningThreshold: options.pingWarningThreshold || 500,
            pingCriticalThreshold: options.pingCriticalThreshold || 1000
        };
    }

    start() {
        console.log('🏥 Health Checker iniciado');
        console.log(`⚙️ Configuración:`);
        console.log(`   - Límite de memoria: ${this.config.maxMemoryMB}MB`);
        console.log(`   - Advertencia: ${this.config.memoryWarningThreshold}% (${(this.config.maxMemoryMB * this.config.memoryWarningThreshold / 100).toFixed(0)}MB)`);
        console.log(`   - Crítico: ${this.config.memoryCriticalThreshold}% (${(this.config.maxMemoryMB * this.config.memoryCriticalThreshold / 100).toFixed(0)}MB)`);
        console.log(`   - Intervalo de chequeo: ${this.config.checkInterval / 60000} minutos`);
        
        setInterval(() => {
            this.performHealthCheck();
        }, this.config.checkInterval);
        setTimeout(() => this.performHealthCheck(), 30000);
    }

    performHealthCheck() {
        try {
            const checks = {
                discord: this.checkDiscordConnection(),
                files: this.checkFileSystem(),
                memory: this.checkMemoryUsage()
            };

            const allHealthy = Object.values(checks).every(check => check.healthy);

            if (allHealthy) {
                this.errorCount = 0;
                this.lastSuccessfulUpdate = Date.now();
                console.log('✅ Health check: OK');
            } else {
                this.errorCount++;
                console.warn(`⚠️ Health check falló (${this.errorCount}/${this.config.maxErrors}):`,
                    Object.entries(checks)
                        .filter(([, check]) => !check.healthy)
                        .map(([name, check]) => `${name}: ${check.message}`)
                );

                if (this.errorCount >= this.config.maxErrors) {
                    this.handleCriticalFailure();
                }
            }

            return checks;
        } catch (error) {
            console.error('❌ Error en health check:', error);
            this.errorCount++;
        }
    }

    checkDiscordConnection() {
        try {
            if (!this.client.isReady()) {
                return { healthy: false, message: 'Bot no conectado a Discord' };
            }

            const ping = this.client.ws.ping;

            if (ping > this.config.pingCriticalThreshold) {
                return { healthy: false, message: `Ping crítico: ${ping}ms` };
            }

            if (ping > this.config.pingWarningThreshold) {
                console.warn(`⚠️ Ping alto: ${ping}ms`);
            }

            return { healthy: true, message: `Ping: ${ping}ms` };
        } catch (error) {
            return { healthy: false, message: error.message };
        }
    }

    checkFileSystem() {
        try {
            const dataDir = path.join(__dirname, '../data');
            const bossesFile = path.join(dataDir, 'bosses.json');
            const logsFile = path.join(dataDir, 'logs.json');

            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Verificar que los archivos son accesibles
            if (fs.existsSync(bossesFile)) {
                fs.accessSync(bossesFile, fs.constants.R_OK | fs.constants.W_OK);
            }

            if (fs.existsSync(logsFile)) {
                fs.accessSync(logsFile, fs.constants.R_OK | fs.constants.W_OK);
            }

            return { healthy: true, message: 'Sistema de archivos OK' };
        } catch (error) {
            return { healthy: false, message: `Error en archivos: ${error.message}` };
        }
    }

    checkMemoryUsage() {
        try {
            const used = process.memoryUsage();
            const heapUsedMB = used.heapUsed / 1024 / 1024;
            const heapTotalMB = used.heapTotal / 1024 / 1024;
            const rssMB = used.rss / 1024 / 1024;
            const externalMB = used.external / 1024 / 1024;

            // Calcular porcentaje basado en heap
            const heapPercent = (heapUsedMB / heapTotalMB) * 100;

            // Obtener límite máximo de memoria configurado (en MB)
            const maxMemoryMB = this.config.maxMemoryMB || 512;
            const rssPercent = (rssMB / maxMemoryMB) * 100;

            // Nivel crítico - basado en RSS real y porcentaje crítico
            const criticalThreshold = this.config.memoryCriticalThreshold || 95; // %
            if (rssPercent > criticalThreshold) {
                return {
                    healthy: false,
                    message: `Memoria CRÍTICA: ${rssMB.toFixed(1)}MB RSS (${rssPercent.toFixed(1)}% de ${maxMemoryMB}MB)`
                };
            }

            // Nivel de advertencia - basado en RSS real y porcentaje de advertencia
            const warningThreshold = this.config.memoryWarningThreshold || 85; // %
            if (rssPercent > warningThreshold) {
                console.warn(`⚠️ Uso de memoria alto: ${rssMB.toFixed(1)}MB RSS (${rssPercent.toFixed(1)}% de ${maxMemoryMB}MB)`);
            }

            return {
                healthy: true,
                message: `RSS: ${rssMB.toFixed(1)}MB | Heap: ${heapUsedMB.toFixed(1)}/${heapTotalMB.toFixed(1)}MB (${heapPercent.toFixed(0)}%)`
            };
        } catch (error) {
            return { healthy: false, message: `Error verificando memoria: ${error.message}` };
        }
    }

    handleCriticalFailure() {
        console.error('🚨 FALLO CRÍTICO: Demasiados errores consecutivos');

        // Intentar limpiar recursos
        try {
            if (global.gc) {
                global.gc();
                console.log('🧹 Garbage collection ejecutado');
            }
        } catch (e) {
            console.error('❌ No se pudo ejecutar garbage collection:', e);
        }

        // Resetear contador para dar otra oportunidad
        this.errorCount = Math.floor(this.config.maxErrors / 2);

        // Aquí podrías agregar lógica adicional como:
        // - Enviar alerta a un canal de administración
        // - Reiniciar el bot automáticamente
        // - Guardar un log de emergencia
    }

    getStatus() {
        return {
            lastSuccessfulUpdate: this.lastSuccessfulUpdate,
            errorCount: this.errorCount,
            uptime: process.uptime(),
            healthy: this.errorCount < this.config.maxErrors,
            config: this.config
        };
    }
}

module.exports = HealthChecker;