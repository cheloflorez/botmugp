class RateLimiter {
    constructor() {
        this.userLastOpen = new Map(); // { userId: lastOpenTime }
        this.globalLimits = new Map();
        
        // Limpiar datos viejos cada 5 minutos
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    
    // Verificar si el usuario puede abrir un módulo
    checkModuleOpen(userId, cooldownMs = 10000) {
        const now = Date.now();
        const lastOpen = this.userLastOpen.get(userId);
        
        // Si no tiene datos, es su primera vez
        if (!lastOpen) {
            this.userLastOpen.set(userId, now);
            return { allowed: true };
        }
        
        // Verificar si pasó el cooldown
        const timeSinceLastOpen = now - lastOpen;
        
        if (timeSinceLastOpen < cooldownMs) {
            const timeToWait = Math.ceil((cooldownMs - timeSinceLastOpen) / 1000);
            return { 
                allowed: false, 
                timeToWait
            };
        }
        
        // Puede abrir el módulo
        this.userLastOpen.set(userId, now);
        return { allowed: true };
    }
    
    // Rate limit global para operaciones pesadas (mantener para protección del servidor)
    checkGlobal(operation, maxRequests = 50, windowMs = 60000) {
        const now = Date.now();
        const history = this.globalLimits.get(operation) || [];
        
        const recentRequests = history.filter(time => now - time < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            return { limited: true };
        }
        
        recentRequests.push(now);
        this.globalLimits.set(operation, recentRequests);
        
        return { limited: false };
    }
    
    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutos de inactividad
        
        // Limpiar datos de usuarios inactivos
        for (const [userId, lastOpen] of this.userLastOpen.entries()) {
            if (now - lastOpen > maxAge) {
                this.userLastOpen.delete(userId);
            }
        }
        
        // Limpiar límites globales
        for (const [op, history] of this.globalLimits.entries()) {
            const recentHistory = history.filter(time => now - time < maxAge);
            if (recentHistory.length === 0) {
                this.globalLimits.delete(op);
            } else {
                this.globalLimits.set(op, recentHistory);
            }
        }
    }
}

module.exports = new RateLimiter();