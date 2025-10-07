const { Events } = require('discord.js');
const { sendHomeMenu } = require('../modules/menu');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Ready! Logged in as ${client.user.tag}`);
        await sendHomeMenu(client);
    }
};
