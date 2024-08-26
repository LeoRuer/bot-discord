const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const db = require('quick.db');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-fermer')
        .setDescription('Fermer le ticket d\'assistance dans ce salon.'),
    async execute(interaction) {
        const channel = interaction.channel;
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Ce n\'est pas un salon de texte.', ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission de fermer les tickets.', ephemeral: true });
        }
        const ticketStatus = await db.get(`ticket_${channel.id}`);
        if (ticketStatus === 'fermé') {
            return interaction.reply({ content: 'Ce ticket est déjà fermé.', ephemeral: true });
        }
        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                ViewChannel: false,
            });
            const userId = await db.get(`ticket_creator_${channel.id}`);
            if (userId) {
                const user = await interaction.guild.members.fetch(userId);
                if (user) {
                    await channel.permissionOverwrites.edit(user.id, {
                        ViewChannel: false,
                    });
                } else {
                    console.warn(`Utilisateur avec l'ID ${userId} non trouvé sur le serveur.`);
                }
            }
            await db.set(`ticket_${channel.id}`, 'fermé');
            await channel.send('Ce ticket est maintenant fermé.');
            await interaction.reply({ content: `Le ticket dans ce salon a été fermé avec succès.`, ephemeral: true });
        } catch (error) {
            console.error('Erreur lors de la fermeture du ticket:', error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la fermeture du ticket.', ephemeral: true });
        }
    },
};
