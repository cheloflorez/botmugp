const calculator = require('../modules/calculator');
const calculatorTime = require('../modules/calculatortime')

module.exports = {
    async handleModal(interaction) {
        if (interaction.customId === 'calc_modal') {
            await calculator.handleModal(interaction);
        }
        if (interaction.customId === 'calc_modal_v2') {
            await calculatorTime.handleModal(interaction);
        }
    }
};
