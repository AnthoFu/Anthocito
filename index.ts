// Archivo principal de Anthocito, este es mi tercer intento XD//

import { Client, Collection } from "discord.js";
import express, { Request, Response } from "express";
import { config } from "dotenv";
import { loadSlash } from "./handlers/slashHandler";
import { loadEvents } from "./handlers/eventHandler";
import { loadDatabase } from "./handlers/databaseHandler";
import { SlashCommand } from "./interfaces/Command";

config(); // Libreria requerida para poder guardar el token del bot en un archivo oculto (.env)

// Eventos y constantes necesarias para funcionar
export class CustomClient extends Client {
    slashCommands: Collection<string, SlashCommand> = new Collection();
}

const client = new CustomClient({ intents: 3276799 });
// Intents de administrador para el bot, basicamente todos los permisos

(async () => {
    await loadDatabase(); // Iniciamos la conexión con MongoDB antes que todo :)
    await client.login(process.env.TOKEN).catch((_err) => console.error(` | Error al iniciar el bot :( => ${_err}`));
})();

loadEvents(client);
client.on("ready", async () => {
    // Evento al prender el bot
    if (!client.user) {
        return;
    }
    await loadSlash(client)
        .then(() => {
            if (client.user) {
                console.log(
                    " | ¡Comandos cargado con exito! :D Puedes revisar los comandos en la carpeta slashCommands "
                );
                console.log(` | Bot encendido y en funcionamiento como: ${client.user.tag}`);
            }
        })
        .catch((_err) => {
            console.error(` | Error al cargar los comandos, ahora que hiciste mal Antho? :( => ${_err}`);
        });
});

// --- Servidor Web Express para mantener el bot activo 24/7 ---
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    res.send("¡El bot está en línea y funcionando!");
});

app.listen(port, () => {
    console.log(` | Servidor web escuchando en el puerto ${port}`);
});
