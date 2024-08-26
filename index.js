const { Client, GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const path = require('path');
const fs = require('fs');
const config = require('./config.json');
const { TOKEN, GUILD_ID } = config;
const COMMANDS_DIR = path.join(__dirname, 'Commandes');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
async function loadCommands() {
    const commands = [];
    const files = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const filePath = path.join(COMMANDS_DIR, file);
        try {
            const command = require(filePath);
            if (command.data && command.execute) {
                commands.push(command.data.toJSON());
            } else {
                console.warn(`Ce fichier est invalide: ${file}`);
            }
        } catch (error) {
            console.error(`Il y a eu une erreur: ${file}`, error);
        }
    }
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('Je refresh les commandes du bot...');
        await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
            body: commands,
        });
        console.log('Les commandes ont été chargées.');
    } catch (error) {
        console.error("Il y a eu une erreur", error);
    }
}
client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const guilds = client.guilds.cache;
    for (const [guildId] of guilds) {
        if (guildId !== GUILD_ID) {
            try {
                const guild = client.guilds.cache.get(guildId);
                if (guild) {
                    await guild.leave();
                    console.log(`Le bot a quitté le serveur: ${guild.name} (${guildId})`);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
    await loadCommands();
});
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    const commandFile = path.join(COMMANDS_DIR, `${commandName}.js`);
    if (fs.existsSync(commandFile)) {
        try {
            const command = require(commandFile);
            if (command.execute) {
                await command.execute(interaction);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        }
    } else {
        console.warn(`La commande n'a pas été trouvée (as-tu modifié le nom du fichier?): ${commandFile}`);
        await interaction.reply({ content: 'Commande non trouvée.', ephemeral: true });
    }
});
client.login(TOKEN);
