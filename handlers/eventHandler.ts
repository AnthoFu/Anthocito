import { readdirSync } from "node:fs";
import { CustomClient } from "../index"; // Import CustomClient

export async function loadEvents(client: CustomClient) {
    readdirSync(`${process.cwd()}/eventos`).forEach((x) => {
        readdirSync(`${process.cwd()}/eventos/${x}`)
            .filter((file) => file.endsWith(".ts"))
            .forEach(async (y) => {
                // Added async here
                const event = await import(`${process.cwd()}/eventos/${x}/${y}`); // Dynamic import
                if (event.default.once) {
                    // Access default export
                    client.once(event.default.name, (...args: unknown[]) => event.default.execute(...args, client));
                } else {
                    client.on(event.default.name, (...args: unknown[]) => event.default.execute(...args, client));
                }
            });
    });
}
