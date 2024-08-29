import { SlashCommandBuilder } from '@discordjs/builders';

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responds with Pong!');

const run = async (client, interaction) => {
    await interaction.reply('Pong!');
};

export default { data, run };
