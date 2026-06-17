// Archivo principal de Anthocito, este es mi tercer intento XD//

import { Client, Collection } from "discord.js";
import express, { Request, Response } from "express";
import { config } from "dotenv";
import { loadSlash } from "./handlers/slashHandler";
import { loadEvents } from "./handlers/eventHandler";
import { loadDatabase } from "./handlers/databaseHandler";
import { SlashCommand } from "./interfaces/Command";
import { Logger } from "./utiles/Logger";

config(); // Libreria requerida para poder guardar el token del bot en un archivo oculto (.env)

// Eventos y constantes necesarias para funcionar
export class CustomClient extends Client {
    slashCommands: Collection<string, SlashCommand> = new Collection();
}

const client = new CustomClient({ intents: 3276799 });
// Intents de administrador para el bot, basicamente todos los permisos

// --- Manejo de errores globales para estabilidad ---
process.on("unhandledRejection", (reason, promise) => {
    Logger.error("Reconcimiento de promesa no manejada:", { promise, reason });
});

process.on("uncaughtException", (err, origin) => {
    Logger.error("Excepción no capturada:", { err, origin });
});

(async () => {
    await loadDatabase(); // Iniciamos la conexión con MongoDB antes que todo :)
    await client.login(process.env.TOKEN).catch((_err) => Logger.error("Error al iniciar el bot :(", _err));
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
                Logger.success("¡Comandos cargados con éxito! :D");
                Logger.info(`Bot encendido y en funcionamiento como: ${client.user.tag}`);
            }
        })
        .catch((_err) => {
            Logger.error("Error al cargar los comandos, ahora que hiciste mal Antho? :(", _err);
        });
});

// --- Servidor Web Express para mantener el bot activo 24/7 ---
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    res.send("¡El bot está en línea y funcionando!");
});

app.listen(port, () => {
    Logger.info(`Servidor web escuchando en el puerto ${port}`);
});
