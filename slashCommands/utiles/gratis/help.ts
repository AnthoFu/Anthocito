import { SlashCommandBuilder, EmbedBuilder, Client, ChatInputCommandInteraction } from "discord.js";
import fs from "fs";
import path from "path";

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Muestra todos los comandos disponibles en un embed."),

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        try {
            const embed = new EmbedBuilder()
                .setTitle("📜 Menú de Ayuda")
                .setColor("#0099ff")
                .setDescription("Aquí tienes una lista de todos los comandos disponibles, organizados por categoría:");

            // Buscamos la carpeta raíz de los comandos (slashCommands)
            // __dirname es .../slashCommands/utiles/gratis
            const slashCommandsPath = path.resolve(__dirname, "..", "..");
            const commandFolders = fs.readdirSync(slashCommandsPath);

            for (const folder of commandFolders) {
                const categoryPath = path.join(slashCommandsPath, folder);
                
                // Saltamos si no es un directorio
                if (!fs.lstatSync(categoryPath).isDirectory()) continue;

                // En mi estructura, los comandos están en subcarpetas como 'gratis'
                const subFolders = fs.readdirSync(categoryPath);
                
                for (const subFolder of subFolders) {
                    const fullPath = path.join(categoryPath, subFolder);
                    if (!fs.lstatSync(fullPath).isDirectory()) continue;

                    const commandFiles = fs.readdirSync(fullPath).filter((file) => 
                        (file.endsWith(".ts") || file.endsWith(".js")) && !file.endsWith(".map")
                    );

                    if (commandFiles.length > 0) {
                        const commandList = commandFiles
                            .map((file) => `\`/${path.parse(file).name}\``)
                            .join(", ");

                        // Capitalizamos el nombre de la categoría (ej: "utiles" -> "Utiles")
                        const categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
                        // Si hay subcategorías (como 'gratis'), podría incluirlas o no
                        const fieldName = subFolder !== "gratis" ? `🛠️ ${categoryName} (${subFolder})` : `🛠️ ${categoryName}`;
                        
                        embed.addFields({ name: fieldName, value: commandList });
                    }
                }
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error al ejecutar el comando help:", error);
            await interaction.reply({ content: "Hubo un error al intentar mostrar la ayuda.", ephemeral: true });
        }
    }
};
