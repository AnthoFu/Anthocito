const { readdirSync } = require("node:fs");

module.exports = {
    async loadSlash(client) {
        const commandObjects = [];
        for (const category of readdirSync("./slashCommands")) {
            for (const otherCategory of readdirSync(`./slashCommands/${category}`)) {
                for (const fileName of readdirSync(`./slashCommands/${category}/${otherCategory}`).filter((file) =>
                    file.endsWith(".js")
                )) {
                    const command = require(`../slashCommands/${category}/${otherCategory}/${fileName}`);

                    if (command.name || command.data?.name) {
                        const commandName = command.data?.name || command.name;
                        const commandPayload = command.data || command;

                        client.slashCommands.set(commandName, command);
                        commandObjects.push(commandPayload);
                    } else {
                        console.warn(
                            `[ADVERTENCIA] El comando en ${fileName} fue omitido por no tener 'name' o 'data.name'.`
                        );
                    }
                }
            }
        }
        await client.application?.commands.set(commandObjects);
    }
};
