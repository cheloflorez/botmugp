const log = require('./logger');

class MetricsCollector {
    constructor() {
        this.metrics = {
            interactions: {
                total: 0,
                buttons: 0,
                modals: 0,
                selects: 0,
                commands: 0
            },
            modules: {
                calculator: 0,
                calculatorTime: 0,
                spots: 0,
                mazeHelper: 0,
                gap: 0,
                tca: 0
            },
            imageGeneration: {
                collages: 0,
                finalImages: 0,
                errors: 0,
                totalTime: 0 // en ms
            },
            errors: {
                total: 0,
                byType: {}
            },
            rateLimits: {
                triggered: 0,
                byUser: {}
            },
            memory: {
                samples: [],
                maxSamples: 100
            }
        };
        
        this.startTime = Date.now();
        
        // Recopilar métricas de memoria cada 30 segundos
        setInterval(() => this.collectMemoryMetrics(), 30000);
        
        // Log de métricas cada 5 minutos
        setInterval(() => this.logMetrics(), 5 * 60 * 1000);
    }
    
    // Incrementar contador genérico
    increment(category, subcategory = null) {
        if (subcategory) {
            if (!this.metrics[category][subcategory]) {
                this.metrics[category][subcategory] = 0;
            }
            this.metrics[category][subcategory]++;
        } else {
            this.metrics[category]++;
        }
    }
    
    // Registrar interacción
    trackInteraction(type, moduleName = null) {
        this.increment('interactions', 'total');
        this.increment('interactions', type);
        
        if (moduleName) {
            this.increment('modules', moduleName);
        }
    }
    
    // Registrar generación de imagen
    trackImageGeneration(type, duration, success = true) {
        this.increment('imageGeneration', type);
        this.metrics.imageGeneration.totalTime += duration;
        
        if (!success) {
            this.increment('imageGeneration', 'errors');
        }
    }
    
    // Registrar error
    trackError(errorType, error) {
        this.increment('errors', 'total');
        
        if (!this.metrics.errors.byType[errorType]) {
            this.metrics.errors.byType[errorType] = 0;
        }
        this.metrics.errors.byType[errorType]++;
        
        log.error(`Error tracked: ${errorType}`, error);
    }
    
    // Registrar rate limit
    trackRateLimit(userId) {
        this.increment('rateLimits', 'triggered');
        
        if (!this.metrics.rateLimits.byUser[userId]) {
            this.metrics.rateLimits.byUser[userId] = 0;
        }
        this.metrics.rateLimits.byUser[userId]++;
    }
    
    // Recopilar métricas de memoria
    collectMemoryMetrics() {
        const usage = process.memoryUsage();
        const sample = {
            timestamp: Date.now(),
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
            rss: Math.round(usage.rss / 1024 / 1024), // MB
            external: Math.round(usage.external / 1024 / 1024) // MB
        };
        
        this.metrics.memory.samples.push(sample);
        
        // Mantener solo las últimas 100 muestras
        if (this.metrics.memory.samples.length > this.metrics.memory.maxSamples) {
            this.metrics.memory.samples.shift();
        }
        
        // Alertar si la memoria es muy alta
        if (sample.heapUsed > 400) { // > 400MB
            log.warn('High memory usage detected', sample);
        }
    }
    
    // Obtener estadísticas de memoria
    getMemoryStats() {
        const samples = this.metrics.memory.samples;
        if (samples.length === 0) return null;
        
        const heapUsedValues = samples.map(s => s.heapUsed);
        
        return {
            current: samples[samples.length - 1],
            avg: Math.round(heapUsedValues.reduce((a, b) => a + b, 0) / heapUsedValues.length),
            max: Math.max(...heapUsedValues),
            min: Math.min(...heapUsedValues)
        };
    }
    
    // Log de métricas periódicas
    logMetrics() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000 / 60); // minutos
        const memStats = this.getMemoryStats();
        
        log.info('=== METRICS REPORT ===', {
            uptime: `${uptime} minutes`,
            interactions: this.metrics.interactions,
            modules: this.metrics.modules,
            images: {
                generated: this.metrics.imageGeneration.collages + this.metrics.imageGeneration.finalImages,
                avgTime: this.metrics.imageGeneration.collages > 0 
                    ? Math.round(this.metrics.imageGeneration.totalTime / (this.metrics.imageGeneration.collages + this.metrics.imageGeneration.finalImages))
                    : 0,
                errors: this.metrics.imageGeneration.errors
            },
            errors: this.metrics.errors.total,
            rateLimits: this.metrics.rateLimits.triggered,
            memory: memStats
        });
    }
    
    // Obtener todas las métricas
    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.startTime,
            memoryStats: this.getMemoryStats()
        };
    }
    
    // Reset de métricas (útil para testing)
    reset() {
        this.metrics.interactions.total = 0;
        // ... reset otros según necesites
    }
}

// Singleton
module.exports = new MetricsCollector();