const { EmbedBuilder } = require("discord.js")

module.exports={
    name:"8ball",
    description:"Deja que anthocito responda tu pregunta. owo",
    options:[
        {
        name:"pregunta",
        description:"Hazle una pregunta a Anthocito",
        type:3,
        required:true
    }],

    async execute(client, interaction){

        const pgr = interaction.options.getString("pregunta")

        var respuestas=["¡Sí!" , 
        "No. o.o",
        "No lo creo... <:en:1098945556459560970> ",
        "De hecho, hay un comic en chochox que lo explica <:gatonerd:1087058390376779888>",
        "No lo se, ¡Vuelve a preguntar! >.<",
        "... Preguntale a Sam",
        "Obviamente, duh",
        "¡Claro que no! ¿Como se te ocurre? put- <:puto:1198470575019003935> ",
        "Yo creo que si... <:en:1098945556459560970>"]

        const botRespuesta= respuestas[Math.floor(Math.random()*respuestas.length)]

        const embed = new EmbedBuilder()
        .setColor=("WHITE")
        .setDescription=(`|Pregunta para: ${client.user.username}\n\n**Pregunta:** ${pgr} \n\n**Respuesta:** ${botRespuesta}`)


        interaction.reply({ embeds: [embed] })
    }
}