import { ColorResolvable } from "discord.js";

/**
 * Configuración centralizada del bot Anthocito
 */
export const Config = {
    colors: {
        main: "#2b2d31" as ColorResolvable,
        success: "Green" as ColorResolvable,
        error: "Red" as ColorResolvable,
        warn: "Yellow" as ColorResolvable
    },
    admins: process.env.SUPER_ADMIN_ID ? process.env.SUPER_ADMIN_ID.split(",") : [],
    footer: "Anthocito Bot • Hecho con ❤️",
    version: "1.7.11"
};
