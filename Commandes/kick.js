const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulser un membre avec une raison spécifique.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'expulsion')
                .setRequired(false)),
    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'expulser des membres.', ephemeral: true });
        }
        if (!member.kickable) {
            return interaction.reply({ content: 'Je ne peux pas expulser ce membre.', ephemeral: true });
        }
        try {
            await member.kick(reason);
            await interaction.reply({ content: `Le membre ${member.user.tag} a été expulsé pour : ${reason}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'expulsion du membre.', ephemeral: true });
        }
    },
};
