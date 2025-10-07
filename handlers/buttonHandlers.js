const {MessageFlags} = require('discord.js')
const calculator = require('../modules/calculator');
const calculatorTime = require('../modules/calculatortime');
const spots = require('../modules/spots');
const mazeHelper = require('../modules/mazehelper');
const tca = require('../modules/tca'); // nuevo
const gap = require('../modules/gap'); // nuevo


const modules = [calculator, spots, mazeHelper];

module.exports = {
    async handleButton(interaction) {
        const id = interaction.customId;

        // Botones principales
        const primaryButtons = {
            open_levelcalc: async () => {
                await calculator.execute(interaction);
            },
            open_timecalc: async () => {
                await calculatorTime.execute(interaction);
            },
            open_spots: async () => {
                await spots.handleInteraction(interaction);
            },
            open_mazehelper: async () => {
                await mazeHelper.handleInteraction(interaction);
            },
            open_tca: async () => {
                await tca.handleInteraction(interaction);
            },
            open_gap: async () => {
                await gap.handleInteraction(interaction);
            },
            buscar_spot: async () => {
                const userData = spots.getUserSelection(interaction.user.id);
                if (!userData.mapa || !userData.elemento) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: '❌ Debes seleccionar un mapa y un elemento primero.', flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.reply({ content: '❌ Debes seleccionar un mapa y un elemento primero.', flags: MessageFlags.Ephemeral });
                    }
                    return;
                }
                await spots.handleSearch(interaction, userData.mapa, userData.elemento);
            },
            volver_spots: async () => { await spots.handleBack(interaction); },
            back_menu: async () => { await mazeHelper.handleBack(interaction); }
        };

        if (primaryButtons[id]) {
            await primaryButtons[id]();
            return;
        }

        // Botones dinámicos MazeHelper
        if (id.startsWith('dir_')) {
            const direction = id.split('_')[1];
            await mazeHelper.handleDirection(interaction, direction);
            return;
        }

        if (id.startsWith('img_')) {
            const [_, direction, idx] = id.split('_');
            await mazeHelper.handleImage(interaction, direction, idx);
            return;
        }

        if (id.startsWith('back_sub_')) {
            const direction = id.split('_')[2];
            await mazeHelper.handleBackSub(interaction, direction);
            return;
        }

        // Ningún botón coincide
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Botón desconocido.', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'Botón desconocido.', flags: MessageFlags.Ephemeral });
        }
    }
};
