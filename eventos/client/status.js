const { ActivityType } = require("discord.js")

module.exports = {
    name: "ready",
    once: true,

    async execute(client, interaction) {

        console.log (" |Estado del bot cargado con exito. :3")

        let statusarray =[
            {
            name: "con la estabilidad mental de Antho",
            type: ActivityType.Playing,
            status: "online"
        },
        {
            name: "a antho sufrir mientras programa",
            type: ActivityType.Watching,
            status:"DoNotDisturb"
        },

        {
            name: "hacer sufrir a Antho.",
            type: ActivityType.Competing,
            status: "idle"
        }
    ]

    setInterval(() => {
        const option = Math.floor(Math.random () * statusarray.length)

        client.user.setPresence({
            activities:
            [{
                name: statusarray[option].name,
                type: statusarray[option].type,
                url: statusarray[option].url
            }],
            status: statusarray[option].status
        })
    },50000)//5000 ~ 5 segundos
    }
}