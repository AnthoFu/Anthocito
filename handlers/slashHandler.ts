import { readdirSync } from "node:fs";
import { ApplicationCommandDataResolvable } from "discord.js";
import { CustomClient } from "../index"; // Import CustomClient

export async function loadSlash(client: CustomClient) {
    const commandPromises: Promise<unknown>[] = [];
    const commandObjects: ApplicationCommandDataResolvable[] = [];

    const categories = readdirSync("./slashCommands");
    for (const category of categories) {
        const otherCategories = readdirSync(`./slashCommands/${category}`);
        for (const otherCategory of otherCategories) {
            const commandFiles = readdirSync(`./slashCommands/${category}/${otherCategory}`).filter((file) =>
                file.endsWith(".ts")
            );
            for (const fileName of commandFiles) {
                commandPromises.push(import(`../slashCommands/${category}/${otherCategory}/${fileName}`));
            }
        }
    }

    const loadedCommands = await Promise.all(commandPromises);

    for (const command of loadedCommands) {
        if (command.default.name || command.default.data?.name) {
            const commandName = command.default.data?.name || command.default.name;
            const commandPayload = command.default.data || command.default;

            client.slashCommands.set(commandName, command.default);
            commandObjects.push(commandPayload);
        } else {
            console.warn('[ADVERTENCIA] El comando fue omitido por no tener "name" o "data.name".');
        }
    }
    await client.application?.commands.set(commandObjects);
}
