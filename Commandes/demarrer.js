const { SlashCommandBuilder } = require('discord.js');
const db = require('quick.db');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('demarrer')
        .setDescription('Recevez 1000$ en un seul coup.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const hasUsedCommand = await db.get(`demarrer_${userId}`);
        if (hasUsedCommand) {
            return interaction.reply({ content: 'Vous avez déjà utilisé cette commande.', ephemeral: true });
        }
        const currentBalance = await db.get(`balance_${userId}`) || 0;
        await db.set(`balance_${userId}`, currentBalance + 1000);
        await db.set(`demarrer_${userId}`, true);
        await interaction.reply({ content: 'Vous avez reçu 1000$ de la banque!', ephemeral: true });
    },
};
