const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const db = require('quick.db');
const config = require("../config.json");
const CATEGORY_ID = config.idticket;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-ouvrir')
        .setDescription('Crée un salon de ticket pour l’utilisateur.'),
    async execute(interaction) {
        const ticketName = interaction.user.username;
        const category = interaction.guild.channels.cache.get(CATEGORY_ID);
        if (!category || category.type !== ChannelType.GuildCategory) {
            return await interaction.reply({ content: 'Catégorie non trouvée ou type incorrect.', ephemeral: true });
        }
        try {
            const newTicketChannel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });
            await db.set(`ticket_${newTicketChannel.id}`, 'ouvert');
            await db.set(`ticket_creator_${newTicketChannel.id}`, interaction.user.id);
            await newTicketChannel.send(`${interaction.user}, merci de patienter. Un membre de l'équipe sera avec vous sous peu.`);
            await interaction.reply({ content: `Le salon ${newTicketChannel} a été créé avec succès.`, ephemeral: true });
        } catch (error) {
            console.error('Erreur lors de la création du salon:', error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la création du salon.', ephemeral: true });
        }
    },
};
