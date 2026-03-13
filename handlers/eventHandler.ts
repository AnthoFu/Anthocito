import { readdirSync } from "node:fs";
import path from "node:path";
import { CustomClient } from "../index";

export async function loadEvents(client: CustomClient) {
    const eventosPath = path.join(__dirname, "..", "eventos");

    readdirSync(eventosPath).forEach((x) => {
        const categoryPath = path.join(eventosPath, x);
        readdirSync(categoryPath)
            .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
            .forEach(async (y) => {
                // Remove extension for the import to let Node/TS resolve it
                const fileNameNoExt = y.slice(0, y.lastIndexOf("."));
                const eventModule = await import(`../eventos/${x}/${fileNameNoExt}`);
                const event = eventModule.default;

                if (event.once) {
                    client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
                }
            });
    });
}
