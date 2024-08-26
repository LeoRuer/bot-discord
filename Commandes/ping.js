const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const net = require('net');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Vérifie la latence d\'un domaine ou d\'une adresse IP avec un port spécifié.')
        .addStringOption(option =>
            option.setName('domaine_ip')
                .setDescription('Le domaine ou l\'adresse IP à vérifier.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('Le port à vérifier.')
                .setRequired(true)),
    async execute(interaction) {
        const domainOrIp = interaction.options.getString('domaine_ip');
        const port = interaction.options.getInteger('port');
        const testLatency = (host, port) => {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const socket = new net.Socket();
                socket.setTimeout(2000);
                socket.on('connect', () => {
                    const latency = Date.now() - start;
                    socket.end();
                    resolve(latency);
                });
                socket.on('timeout', () => {
                    socket.destroy();
                    reject(new Error('Timeout'));
                });
                socket.on('error', (err) => {
                    reject(err);
                });
                socket.connect(port, host);
            });
        };
        try {
            const latency = await testLatency(domainOrIp, port);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Réponse reçue')
                .addFields(
                    { name: 'Domaine/IP', value: `\`${domainOrIp}\``, inline: true },
                    { name: 'Port', value: `\`${port.toString()}\``, inline: true },
                    { name: 'Latence', value: `\`${latency}ms\``, inline: true }
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Erreur')
                .addFields(
                    { name: 'Domaine/IP', value: domainOrIp, inline: true },
                    { name: 'Port', value: port.toString(), inline: true },
                    { name: 'Erreur', value: error.message, inline: true }
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
    },
};
