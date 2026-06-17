import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { CustomClient } from "../index";

/**
 * Función para obtener todos los archivos de eventos de forma recursiva
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

export async function loadEvents(client: CustomClient) {
    const eventosPath = path.join(__dirname, "..", "eventos");

    const allFiles = getFilesRecursive(eventosPath);

    // Importamos todos los módulos en paralelo para cumplir con las reglas de ESLint
    const eventModules = await Promise.all(
        allFiles.map(async (filePath) => {
            const module = await import(filePath);
            return { filePath, event: module.default };
        })
    );

    for (const { filePath, event } of eventModules) {
        if (event && event.name) {
            if (event.once) {
                client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
            }
        } else {
            console.warn(
                ` [ADVERTENCIA] El archivo de evento en ${filePath} no tiene un nombre válido o no es un export default.`
            );
        }
    }
}
