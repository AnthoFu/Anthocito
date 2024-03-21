const { readdirSync } = require("node:fs");

module.exports = {
    async loadSlash(client){
        for(const category of readdirSync("./slashCommands")){
            for(const otherCategory of readdirSync(`./slashCommands/${category}`)){
                for(const fileName of readdirSync (`./slashCommands/${category}/${otherCategory}`).filter((file) => file.endsWith(".js"))){
                    const command = require(`../slashCommands/${category}/${otherCategory}/${fileName}`);
                    client.slashCommands.set(command.name, command);
                }
            }
        }
        await client.application?.commands.set(client.slashCommands.map((x)=> x));
    },
};