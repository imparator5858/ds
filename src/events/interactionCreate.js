import { InteractionType } from 'discord.js';

export const interactionCreate = {
    name: 'interactionCreate',
    execute: async (interaction) => {
        let client = interaction.client;
        if (interaction.type !== InteractionType.ApplicationCommand) return;
        if (interaction.user.bot) return;

        const command = client.commands.get(interaction.commandName.toLowerCase());
        if (command) {
            command.run(client, interaction);
        }
    }
};
