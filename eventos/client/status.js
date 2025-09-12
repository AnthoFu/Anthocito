const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        console.log(" | Estado del bot cargado con exito. :3 Se puede modificar el archivo en status.js");

        const statusarray = [
            {
                name: "con la estabilidad mental de Antho",
                type: ActivityType.Playing,
                status: "online"
            },
            {
                name: "a Antho sufrir mientras programa",
                type: ActivityType.Watching,
                status: "online"
            },

            {
                name: "hacer sufrir a Antho.",
                type: ActivityType.Competing,
                status: "online"
            }
        ];

        setInterval(() => {
            const option = Math.floor(Math.random() * statusarray.length);

            client.user.setPresence({
                activities: [
                    {
                        name: statusarray[option].name,
                        type: statusarray[option].type,
                        url: statusarray[option].url
                    }
                ],
                status: statusarray[option].status
            });
        }, 30000); // 1000 ~ 1 segundo - 300000 = 300 segundos o 5 minutos.
    }
};
