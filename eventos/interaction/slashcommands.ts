import { Interaction } from "discord.js";
import { CustomClient } from "../../index";

export default {
    name: "interactionCreate",

    async execute(interaction: Interaction, client: CustomClient) {
        if (!interaction.isChatInputCommand()) return;

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;

        console.log(` | El usuario "${interaction.user.tag}" ejecutó el comando: /${interaction.commandName}`);

        try {
            await cmd.execute(client, interaction);
        } catch (error) {
            console.error(` | [ERROR] Error al ejecutar /${interaction.commandName}:`, error);

            const errorMessage = "Hubo un error al ejecutar este comando. Por favor, intenta de nuevo más tarde.";

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
