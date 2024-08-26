const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un membre avec une raison spécifique.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false)),
    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission de bannir des membres.', ephemeral: true });
        }
        if (!member.bannable) {
            return interaction.reply({ content: 'Je ne peux pas bannir ce membre.', ephemeral: true });
        }
        try {
            await member.ban({ reason });
            await interaction.reply({ content: `Le membre ${member.user.tag} a été banni pour : ${reason}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors du bannissement du membre.', ephemeral: true });
        }
    },
};
