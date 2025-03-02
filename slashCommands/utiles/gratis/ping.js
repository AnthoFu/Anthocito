const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Comando para saber la latencia con el bot",

    async execute(client, interaction){
        
        let ping = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
        .setColor("Purple")
        .setDescription(`Ping => ${ping}`)

        interaction.reply({ embeds: [embed] })
        
        console.log(` | Se ha utilizado el comando ${this.name}`)
    }
}