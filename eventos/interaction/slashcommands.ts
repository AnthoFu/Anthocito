import { Interaction } from "discord.js";
import { CustomClient } from "../../index";

export default {
    name: "interactionCreate",

    async execute(interaction: Interaction, client: CustomClient) {
        if (!interaction.isChatInputCommand()) return;

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;

        console.log(` | El usuario "${interaction.user.tag}" ejecutó el comando: /${interaction.commandName}`);

        cmd.execute(client, interaction);
    }
};
