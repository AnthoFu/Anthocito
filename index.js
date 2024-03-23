//Archivo principal de Anthocito, este es mi tercer intento XD//

const Discord = require("discord.js"); //Libreria necesaria para poder ejecutar procesos de Discord
const { Client, Collection } = require("discord.js"); // Eventos y constantes necesarias para funcionar 
const client = new Client ({ intents: 3276799 }) //Intents de administrador para el bot, basicamente todos los permisos
const { loadSlash } = require("./handlers/slashHandler"); //Importa la funcion de manejo de slash commands


require("dotenv").config(); //Libreria requerida para poder guardar el token del bot en un archivo oculto (.env)

client.on("interactionCreate" , async (interaction) => { //Creacion de los slash commands
    if(!interaction.isCommand()) return;
    const cmd = client.slashCommands.get(interaction.commandName);
    if(!cmd) return;

    const args=[];
    for(let option of interaction.options.data){
        if(option.type === 1){
            if (option.name) args.push(option.name);
            option.options?.forEach((x)=>{
                if(x.value) args.push(x.value);
            });
        } else if (option.value) args.push(option.value);
    }
    cmd.execute (client, interaction, args);
})

client.slashCommands = new Collection(); //Recoleccion al crear un nuevo Slash Command :)

(async () =>{
    await client
    .login(process.env.TOKEN)
    .catch((err)=>
        console.error(` | Error al iniciar el bot :( => ${err}`)
        );
    
})();


client.on("ready" , async () => { //Evento al prender el bot
    await loadSlash(client)
    .then(()=>{
        console.log(" | Comandos cargado con exito! :D ");
        console.log(` | Bot encendido y en funcionamiento como: ${client.user.tag}`)
    })
    .catch((err) =>{
        console.error(` | Error al cargar los comandos, ahora que hiciste mal Antho? :( => ${err}`);
    })
})