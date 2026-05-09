import { ChatInputCommandInteraction, ApplicationCommandData, ApplicationCommandDataResolvable } from "discord.js";
import { CustomClient } from "../index";

/**
 * Interfaz para definir la estructura de un Slash Command en Anthocito
 */
export interface SlashCommand {
    /**
     * Define si el comando está habilitado o no.
     * Si es falso, no se registrará en Discord.
     */
    enabled?: boolean;

    /**
     * Nombre del comando (opcional si se usa 'data')
     */
    name?: string;

    /**
     * Descripción del comando (opcional si se usa 'data')
     */
    description?: string;

    /**
     * Datos del comando para registrar en la API de Discord
     */
    data?: ApplicationCommandDataResolvable | ApplicationCommandData;

    /**
     * Función que se ejecuta al llamar al comando
     * @param client Instancia personalizada del cliente
     * @param interaction La interacción de Discord
     */
    execute: (client: CustomClient, interaction: ChatInputCommandInteraction) => Promise<void> | void;
}
