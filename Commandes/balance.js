const { SlashCommandBuilder } = require('discord.js');
const db = require('quick.db');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Affiche votre solde d\'argent.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const balance = await db.get(`balance_${userId}`) || 0;
        await interaction.reply({ content: `Votre solde est de $${balance}.`, ephemeral: true });
    },
};
