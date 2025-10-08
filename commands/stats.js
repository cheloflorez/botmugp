const { EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const metrics = require('../utils/metrics');
const config = require('../configs/config');

module.exports = {
    data: {
        name: 'stats',
        description: 'Muestra estadísticas del bot (solo admins)',
        default_member_permissions: PermissionFlagsBits.Administrator.toString()
    },
    
    async execute(interaction) {
        // Doble verificación de permisos
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ Este comando solo está disponible para administradores.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const allMetrics = metrics.getMetrics();
            const memStats = allMetrics.memoryStats;
            const uptime = Math.floor(process.uptime());
            const memUsage = process.memoryUsage();

            // Formatear uptime
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const uptimeStr = `${days}d ${hours}h ${minutes}m`;

            // Embed principal
            const mainEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('📊 Estadísticas del Bot')
                .setDescription(`Métricas desde el último reinicio`)
                .addFields(
                    {
                        name: '⏱️ Uptime',
                        value: `\`\`\`${uptimeStr}\`\`\``,
                        inline: true
                    },
                    {
                        name: '🌐 Servidores',
                        value: `\`\`\`${interaction.client.guilds.cache.size}\`\`\``,
                        inline: true
                    },
                    {
                        name: '📡 Ping',
                        value: `\`\`\`${interaction.client.ws.ping}ms\`\`\``,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'Powered by Chelo', iconURL: interaction.client.user.displayAvatarURL() });

            // Embed de memoria
            const memoryEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('💾 Uso de Memoria')
                .addFields(
                    {
                        name: 'Heap Usado',
                        value: `\`\`\`${Math.round(memUsage.heapUsed / 1024 / 1024)}MB\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Heap Total',
                        value: `\`\`\`${Math.round(memUsage.heapTotal / 1024 / 1024)}MB\`\`\``,
                        inline: true
                    },
                    {
                        name: 'RSS',
                        value: `\`\`\`${Math.round(memUsage.rss / 1024 / 1024)}MB\`\`\``,
                        inline: true
                    }
                );

            if (memStats && memStats.avg) {
                memoryEmbed.addFields(
                    {
                        name: 'Promedio',
                        value: `\`\`\`${memStats.avg}MB\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Máximo',
                        value: `\`\`\`${memStats.max}MB\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Mínimo',
                        value: `\`\`\`${memStats.min}MB\`\`\``,
                        inline: true
                    }
                );
            }

            // Embed de interacciones
            const interactionsEmbed = new EmbedBuilder()
                .setColor(0xe67e22)
                .setTitle('🎮 Interacciones')
                .addFields(
                    {
                        name: 'Total',
                        value: `\`\`\`${allMetrics.interactions.total.toLocaleString()}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Botones',
                        value: `\`\`\`${allMetrics.interactions.buttons.toLocaleString()}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Modales',
                        value: `\`\`\`${allMetrics.interactions.modals.toLocaleString()}\`\`\``,
                        inline: true
                    }
                );

            // Top 3 módulos más usados
            const moduleEntries = Object.entries(allMetrics.modules)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

            if (moduleEntries.length > 0) {
                const topModules = moduleEntries
                    .map(([name, count], idx) => `${idx + 1}. **${name}**: ${count.toLocaleString()}`)
                    .join('\n');
                
                interactionsEmbed.addFields({
                    name: '🏆 Módulos Más Usados',
                    value: topModules || 'N/A',
                    inline: false
                });
            }

            // Embed de imágenes (si hay)
            const imageEmbed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle('🖼️ Generación de Imágenes');

            const totalImages = (allMetrics.imageGeneration?.collages || 0) + 
                              (allMetrics.imageGeneration?.finalImages || 0);

            if (totalImages > 0) {
                const avgTime = allMetrics.imageGeneration.totalTime / totalImages;
                
                imageEmbed.addFields(
                    {
                        name: 'Collages',
                        value: `\`\`\`${(allMetrics.imageGeneration?.collages || 0).toLocaleString()}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Finales',
                        value: `\`\`\`${(allMetrics.imageGeneration?.finalImages || 0).toLocaleString()}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Tiempo Promedio',
                        value: `\`\`\`${Math.round(avgTime)}ms\`\`\``,
                        inline: true
                    }
                );

                if (allMetrics.imageGeneration.errors > 0) {
                    imageEmbed.addFields({
                        name: '⚠️ Errores',
                        value: `\`\`\`${allMetrics.imageGeneration.errors}\`\`\``,
                        inline: true
                    });
                }
            } else {
                imageEmbed.setDescription('No se han generado imágenes aún.');
            }

            // Embed de errores y rate limits
            const issuesEmbed = new EmbedBuilder()
                .setColor(allMetrics.errors.total > 10 ? 0xe74c3c : 0x95a5a6)
                .setTitle('⚠️ Errores y Rate Limits')
                .addFields(
                    {
                        name: 'Errores Totales',
                        value: `\`\`\`${allMetrics.errors.total}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Rate Limits',
                        value: `\`\`\`${allMetrics.rateLimits?.triggered || 0}\`\`\``,
                        inline: true
                    }
                );

            // Tipos de errores si hay
            const errorTypes = Object.entries(allMetrics.errors.byType || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

            if (errorTypes.length > 0) {
                const errorList = errorTypes
                    .map(([type, count]) => `• **${type}**: ${count}`)
                    .join('\n');
                
                issuesEmbed.addFields({
                    name: 'Tipos de Errores',
                    value: errorList,
                    inline: false
                });
            }

            // Información del sistema
            const sysEmbed = new EmbedBuilder()
                .setColor(0x34495e)
                .setTitle('⚙️ Sistema')
                .addFields(
                    {
                        name: 'Node.js',
                        value: `\`\`\`${process.version}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Entorno',
                        value: `\`\`\`${config.env}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'PID',
                        value: `\`\`\`${process.pid}\`\`\``,
                        inline: true
                    }
                );

            // Enviar todos los embeds
            await interaction.editReply({
                embeds: [mainEmbed, memoryEmbed, interactionsEmbed, imageEmbed, issuesEmbed, sysEmbed]
            });

        } catch (error) {
            console.error('Error in stats command:', error);
            await interaction.editReply({
                content: '❌ Error al obtener las estadísticas.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};