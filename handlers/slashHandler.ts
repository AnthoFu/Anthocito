import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { ApplicationCommandDataResolvable } from "discord.js";
import { CustomClient } from "../index";

/**
 * Función para obtener todos los archivos de comandos de forma recursiva
 */
function getFilesRecursive(dir: string): string[] {
    let results: string[] = [];
    const list = readdirSync(dir);

    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursive(filePath));
        } else if (file.endsWith(".ts") || file.endsWith(".js")) {
            results.push(filePath);
        }
    }
    return results;
}

export async function loadSlash(client: CustomClient) {
    const commandObjects: ApplicationCommandDataResolvable[] = [];

    // Ruta a slashCommands relativa a este archivo
    const slashPath = path.join(__dirname, "..", "slashCommands");

    // Obtenemos todos los archivos de comandos recursivamente
    const allFiles = getFilesRecursive(slashPath);

    // Importamos todos los módulos en paralelo para evitar await en el bucle
    const commandModules = await Promise.all(
        allFiles.map(async (filePath) => {
            const module = await import(filePath);
            return { filePath, module: module.default };
        })
    );

    for (const { filePath, module: commandData } of commandModules) {
        if (commandData) {
            const { data } = commandData;

            // Omitir comando si está explícitamente desactivado
            if (commandData.enabled !== false) {
                const dataName = data && "name" in data ? (data.name as string) : null;

                if (commandData.name || dataName) {
                    const commandName = (dataName || commandData.name) as string;

                    let commandPayload: ApplicationCommandDataResolvable;

                    if (data) {
                        commandPayload = data;
                    } else {
                        commandPayload = {
                            name: commandData.name as string,
                            description: commandData.description as string
                        };
                    }

                    client.slashCommands.set(commandName, commandData);
                    commandObjects.push(commandPayload);
                } else {
                    console.warn(
                        `[ADVERTENCIA] El comando en ${filePath} fue omitido por no tener "name" o "data.name".`
                    );
                }
            } else {
                const commandName =
                    (data && "name" in data ? (data.name as string) : null) || commandData.name || "Desconocido";
                console.info(`[INFO] El comando "/${commandName}" ha sido omitido porque está desactivado.`);
            }
        } else {
            console.warn(`[ADVERTENCIA] El archivo ${filePath} no exporta un comando por defecto.`);
        }
    }

    await client.application?.commands.set(commandObjects);
}
