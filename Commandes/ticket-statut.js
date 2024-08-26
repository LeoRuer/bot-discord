const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('quick.db');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-statut')
        .setDescription('Vérifier le statut d\'un ticket d\'assistance.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('L\'ID du salon de ticket à vérifier')
                .setRequired(true)),
    async execute(interaction) {
        const channelId = interaction.options.getString('id');
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Salon invalide ou non trouvé.', ephemeral: true });
        }
        const ticketStatus = await db.get(`ticket_${channelId}`);
        if (ticketStatus) {
            await interaction.reply({ content: `Ce ticket est ${ticketStatus}`, ephemeral: true });
        } else {
            await interaction.reply({ content: "Ce salon n'est pas un ticket ou il est ouvert.", ephemeral: true });
        }
    },
};
