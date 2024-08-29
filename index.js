import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config.js';
import { readdirSync } from 'fs';
import moment from 'moment';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import './src/utils/logger.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ],
    shards: "auto",
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember
    ]
});

const { bot, database } = config;
client.commands = new Collection();
client.events = new Collection();

const rest = new REST({ version: '10' }).setToken(bot.token);

const commands = [];
const commandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const commandModule = await import(`./src/commands/${file}`);
        const command = commandModule.default;
        if (!command.data) {
            log.error(`No data found in ${file}.`);
            continue;
        }
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    } catch (error) {
        log.error(`Error importing command ${file}: ${error}`);
    }
}



client.on("ready", async () => {
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
    } catch (error) {
        log.error(error);
    }
    log.info(`${client.user.username} başarıyla giriş yaptı!`)
});

const eventFiles = readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    try {
        const eventModule = await import(`./src/events/${file}`);
        const event = eventModule[eventModule.default ? 'default' : Object.keys(eventModule)[0]];
        client.events.set(event.name, event)
        client.on(event.name, (...args) => event.execute(...args));
    } catch (error) {
        log.error(`Error importing event ${file}: ${error}`);
    }
}


client.login(bot.token);
