const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, InteractionCollector } = require('discord.js');
const db = require('quick.db');
const { createDeck, shuffleDeck, drawCard, calculateHandValue, getCardName } = require('../blackjackUtils');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Jouez au blackjack !')
        .addIntegerOption(option =>
            option.setName('mise')
                .setDescription('La mise pour le jeu')
                .setRequired(true)),
    async execute(interaction) {
        const bet = interaction.options.getInteger('mise');
        const userId = interaction.user.id;
        const currentBalance = await db.get(`balance_${userId}`) || 0;
        if (bet > currentBalance) {
            return interaction.reply({ content: 'Vous n\'avez pas assez d\'argent pour cette mise.', ephemeral: true });
        }
        await db.subtract(`balance_${userId}`, bet);
        const deck = shuffleDeck(createDeck());
        const playerHand = [drawCard(deck), drawCard(deck)];
        const dealerHand = [drawCard(deck), drawCard(deck)];
        const embed = new EmbedBuilder()
            .setTitle('Jeu de Blackjack')
            .setDescription(`**Votre main :**\n${playerHand.map(card => getCardName(card)).join('\n')}\n\n**Main du croupier :**\n${getCardName(dealerHand[0])}\n???`)
            .setColor('#ffffff');
        const hitButton = new ButtonBuilder()
            .setCustomId('hit')
            .setLabel('Hit')
            .setStyle(ButtonStyle.Primary);
        const standButton = new ButtonBuilder()
            .setCustomId('stand')
            .setLabel('Stand')
            .setStyle(ButtonStyle.Secondary);
        const actionRow = new ActionRowBuilder()
            .addComponents(hitButton, standButton);
        await interaction.reply({ embeds: [embed], components: [actionRow] });
        const filter = i => i.customId === 'hit' || i.customId === 'stand';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async i => {
            if (i.user.id !== userId) {
                return i.reply({ content: 'Ce n\'est pas votre jeu.', ephemeral: true });
            }
            if (i.customId === 'hit') {
                playerHand.push(drawCard(deck));
                const playerValue = calculateHandValue(playerHand);
                const dealerValue = calculateHandValue(dealerHand);
                if (playerValue > 21) {
                    await i.update({ content: 'Vous avez perdu !', embeds: [], components: [] });
                    return collector.stop();
                }
                const updatedEmbed = new EmbedBuilder()
                    .setTitle('Jeu de Blackjack')
                    .setDescription(`**Votre main :**\n${playerHand.map(card => getCardName(card)).join('\n')}\n\n**Main du croupier :**\n${getCardName(dealerHand[0])}\n???`)
                    .setColor('#ffffff');
                await i.update({ embeds: [updatedEmbed], components: [actionRow] });
            } else if (i.customId === 'stand') {
                let dealerValue = calculateHandValue(dealerHand);
                while (dealerValue < 17) {
                    dealerHand.push(drawCard(deck));
                    dealerValue = calculateHandValue(dealerHand);
                }
                const playerValue = calculateHandValue(playerHand);
                let resultMessage = '';
                if (playerValue > 21) {
                    resultMessage = 'Vous avez perdu !';
                } else if (dealerValue > 21 || playerValue > dealerValue) {
                    resultMessage = 'Vous avez gagné !';
                    await db.add(`balance_${userId}`, bet * 2);
                } else if (playerValue < dealerValue) {
                    resultMessage = 'Vous avez perdu !';
                } else {
                    resultMessage = 'Égalité !';
                    await db.add(`balance_${userId}`, bet);
                }
                const finalEmbed = new EmbedBuilder()
                    .setTitle('Jeu de Blackjack')
                    .setDescription(`**Votre main :**\n${playerHand.map(card => getCardName(card)).join('\n')}\n\n**Main du croupier :**\n${dealerHand.map(card => getCardName(card)).join('\n')}\n\n${resultMessage}`)
                    .setColor(resultMessage.includes('gagné') ? '#00ff00' : '#ff0000');
                await i.update({ embeds: [finalEmbed], components: [] });
                collector.stop();
            }
        });
        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({ content: 'Le temps est écoulé.', components: [] });
            }
        });
    },
};
