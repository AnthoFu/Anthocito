import { Interaction, CommandInteractionOptionResolver } from "discord.js";
import { CustomClient } from "../../index";

export default {
    name: "interactionCreate",

    async execute(interaction: Interaction, client: CustomClient) {
        if (!interaction.isChatInputCommand()) return;

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;

        console.log(` | El usuario "${interaction.user.tag}" ejecutó el comando: /${interaction.commandName}`);

        const args: (string | number | boolean)[] = [];
        if (interaction.options instanceof CommandInteractionOptionResolver) {
            for (const option of interaction.options.data) {
                if (option.type === 1) {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) args.push(option.value);
            }
        }
        cmd.execute(client, interaction, args);
    }
};
