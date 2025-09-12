// Archivo principal de Anthocito, este es mi tercer intento XD//

const { Client, Collection } = require("discord.js");
// Eventos y constantes necesarias para funcionar
const client = new Client({ intents: 3276799 });
// Intents de administrador para el bot, basicamente todos los permisos
const { loadSlash } = require("./handlers/slashHandler"); // Importa la funcion de manejo de slash commands
const { loadEvents } = require("./handlers/eventHandler"); // Importa la funcion de manejo de eventos

require("dotenv").config(); // Libreria requerida para poder guardar el token del bot en un archivo oculto (.env)

client.slashCommands = new Collection(); // Recoleccion al crear un nuevo Slash Command :)

(async () => {
    await client.login(process.env.TOKEN).catch((err) => console.error(` | Error al iniciar el bot :( => ${err}`));
})();

loadEvents(client);
client.on("ready", async () => {
    // Evento al prender el bot
    await loadSlash(client)
        .then(() => {
            console.log(" | ¡Comandos cargado con exito! :D Puedes revisar los comandos en la carpeta slashCommands ");
            console.log(` | Bot encendido y en funcionamiento como: ${client.user.tag}`);
        })
        .catch((err) => {
            console.error(` | Error al cargar los comandos, ahora que hiciste mal Antho? :( => ${err}`);
        });
});
