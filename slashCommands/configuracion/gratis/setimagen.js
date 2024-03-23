const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "setimagen",
    description: "Poner una imagen animada al bot",
    options:[
        {
            name:"imagen",
            description:"Selecciona la imagen",
            type:11,
            require:true
        }
    ],

    async execute(client, interaction){

        const avatar = interaction.options.getAttachment("imagen")

        await client.user.setAvatar(avatar.url).catch(async err =>{
        })
        interaction.reply({content: "La imagen ha sido cargada con exito, felicidades, eres un genio (Mentira)"})
    }

}