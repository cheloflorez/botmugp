const { Events } = require('discord.js');
const { sendHomeMenu } = require('../modules/menu');
const botConfig = require('../configs/botConfig');
const HealthChecker = require('../utils/healthCheck');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Ready! Logged in as ${client.user.tag}`);
        client.user.setPresence({
            activities: [{ name: botConfig.discord.presence.activity, type: botConfig.discord.presence.type }],
            status: botConfig.discord.presence.status
        });

        // 🏥 Iniciar health checker con configuración desde botConfig
        const healthChecker = new HealthChecker(client, {
            maxErrors: botConfig.errorHandling.maxConsecutiveErrors,
            checkInterval: botConfig.intervals.healthCheck,
            memoryWarningThreshold: botConfig.memory.warningThresholdPercent,
            memoryCriticalThreshold: botConfig.memory.criticalThresholdPercent, // MB absolutos
            pingWarningThreshold: botConfig.connection.pingWarning,
            pingCriticalThreshold: botConfig.connection.pingCritical,
            maxMemoryMB: botConfig.memory.maxMemoryMB, // ← Límite en MB
        });
        healthChecker.start();
        client.healthChecker = healthChecker;

        // 📊 Estado general
        setInterval(() => {
            try {
                const used = process.memoryUsage();
                const toMB = (b) => (b / 1024 / 1024).toFixed(2) + " MB";
                const ram = `RSS: ${toMB(used.rss)} | Heap: ${toMB(used.heapUsed)}/${toMB(used.heapTotal)} | Ext: ${toMB(used.external)}`;
                const uptime = `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`;
                const guilds = client.guilds.cache.size;
                const users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

                console.log("════════════════════════════");
                console.log("📊 ESTADO DEL BOT");
                console.log(`⏰ Uptime: ${uptime}`);
                console.log(`💾 Memoria: ${ram}`);
                console.log(`🌐 Servidores: ${guilds} | 👥 Usuarios aprox: ${users}`);
                console.log("════════════════════════════");
            } catch (error) {
                console.error('❌ Error mostrando estado:', error);
            }
        }, 60 * 60 * 1000);

        await sendHomeMenu(client);
    }
};
