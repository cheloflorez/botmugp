async function replyAndDelete(interaction, options = {}, delay = 30000) {
    try {
        const reply = await interaction.reply(options);
        const message = await interaction.fetchReply();

        setTimeout(() => {
            message.delete().catch(() => {});
        }, delay);

        return reply;
    } catch (e) {
        console.error("❌ No se pudo eliminar el mensaje:", e);
    }
}

module.exports = replyAndDelete;
