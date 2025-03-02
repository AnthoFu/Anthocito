const { EmbedBuilder } = require("discord.js");//Requerimos los paquetes

module.exports = {
	name: "clear",
	description: "Borrar la cantidad de mensajes que coloques",
    options: [
        {
        name:"cantidad",
        description:"Cantidad de mensajes que desea borrar (maximo 100 mensajes).",
        type:10,
        required:true,
        maxValue:100,
        minValue:1
    },
    {
        name:"usuario",
        description:"Menciona al usuario que deseas borrar sus mensajes",
        type:6,
        required:false
    },
    {
        name:"canal",
        description:"Menciona el canal",
        type:7,
        channelTypes:[0],
        required:false
    }
    ],

	async execute(client, interaction){

		const cantidad = interaction.options.getNumber("cantidad")
		const usuario = interaction.options.getUser("usuario")
		const canal = interaction.options.getChannel("canal") || interaction.channel;

        if(!interaction.member.permissions.has("ManageMessages")) return interaction.reply({ content: "No tienes los suficientes permisos para utilizar este comando, ¡Tonto!"})
            const mensajes = await interaction.channel.messages.fetch()


        if(usuario){
            let i = 0;
            const filtered = [];
            (await mensajes).filter((m) =>{
                if (m.author.id === usuario.id && cantidad > i){
                    filtered.push(m)
                    i++;
                }
            })
    
            await canal.bulkDelete(filtered, true).then(messages => {
                interaction.reply({content: `Se han borrado ${messages.size} mensajes del usuario ${usuario}, ¿Lo odias acaso? :c`})
            })  
        
        } else {
        
            await canal.bulkDelete(cantidad, true).then(messages => {
                interaction.reply({content: `Se han borrado ${messages.size} mensajes del canal ${canal} Awebo que sí`})
            })

            console.log(` | Se ha utilizado el comando ${this.name}`)

        }
    }
}
