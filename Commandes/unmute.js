const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Enlever le mode muet d\'un membre.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre dont enlever le mute')
                .setRequired(true)),
    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission de gérer les membres.', ephemeral: true });
        }
        if (!member || !member.manageable) {
            return interaction.reply({ content: 'Je ne peux pas enlever le mute de ce membre.', ephemeral: true });
        }
        try {
            await member.timeout(null, 'Timeout supprimé par un modérateur.');
            await interaction.reply({ content: `Le membre ${member.user.tag} n'est plus muet.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors du démute du membre.', ephemeral: true });
        }
    },
};
