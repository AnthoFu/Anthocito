import { readdirSync } from "node:fs";
import path from "node:path";
import { ApplicationCommandDataResolvable } from "discord.js";
import { CustomClient } from "../index";

export async function loadSlash(client: CustomClient) {
    const commandPromises: Promise<any>[] = [];
    const commandObjects: ApplicationCommandDataResolvable[] = [];

    // Path to slashCommands relative to this file
    const slashPath = path.join(__dirname, "..", "slashCommands");

    const categories = readdirSync(slashPath);
    for (const category of categories) {
        const categoryPath = path.join(slashPath, category);
        const otherCategories = readdirSync(categoryPath);
        for (const otherCategory of otherCategories) {
            const otherCategoryPath = path.join(categoryPath, otherCategory);
            const commandFiles = readdirSync(otherCategoryPath).filter((file) =>
                file.endsWith(".ts") || file.endsWith(".js")
            );
            for (const fileName of commandFiles) {
                // Remove extension for the import to let Node/TS resolve it
                const fileNameNoExt = fileName.slice(0, fileName.lastIndexOf("."));
                commandPromises.push(import(`../slashCommands/${category}/${otherCategory}/${fileNameNoExt}`));
            }
        }
    }

    const loadedCommands = await Promise.all(commandPromises);

    for (const command of loadedCommands) {
        const commandData = command.default;
        if (commandData.name || commandData.data?.name) {
            const commandName = commandData.data?.name || commandData.name;
            const commandPayload = commandData.data || commandData;

            client.slashCommands.set(commandName, commandData);
            commandObjects.push(commandPayload);
        } else {
            console.warn('[ADVERTENCIA] El comando fue omitido por no tener "name" o "data.name".');
        }
    }
    await client.application?.commands.set(commandObjects);
}
