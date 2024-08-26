const { SlashCommandBuilder, PermissionsBitField, ChannelType, GuildMember } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Rendre un membre muet avec une raison spécifique.')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à rendre muet')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duree')
                .setDescription('Durée du mute en minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du mute')
                .setRequired(false)),
    async execute(interaction) {
        const member = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
        const duration = interaction.options.getInteger('duree');
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission de rendre des membres muets.', ephemeral: true });
        }
        if (!member || !(member instanceof GuildMember)) {
            return interaction.reply({ content: 'Le membre spécifié est invalide.', ephemeral: true });
        }
        if (!member.manageable) {
            return interaction.reply({ content: 'Je ne peux pas rendre ce membre muet.', ephemeral: true });
        }
        try {
            const durationMs = duration * 60 * 1000;
            await member.timeout(durationMs, reason);
            await interaction.reply({ content: `${member.user.tag} a été rendu muet pour ${duration} minutes: ${reason}` });
        } catch (error) {
            console.error(error);
        }
    },
};
