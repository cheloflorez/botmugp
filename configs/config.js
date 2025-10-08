require('dotenv').config();


module.exports = {
    env: process.env.NODE_ENV || 'development',
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
        helpChannelId: process.env.HELP_CHANNEL
    }
};