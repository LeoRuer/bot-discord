const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertir un membre avec une raison spécifique.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à avertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'avertissement')
                .setRequired(true)),
    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison');
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'avertir des membres.', ephemeral: true });
        }
        await interaction.reply({
            content: `<@${member.user.id}> a été averti pour: \`${reason}\``
        });
    },
};
