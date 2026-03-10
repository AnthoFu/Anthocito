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

            const commandFolders = fs.readdirSync(path.join(__dirname, "..", ".."));

            for (const folder of commandFolders) {
                const gratisFolder = path.join(__dirname, "..", "..", folder, "gratis");
                if (fs.existsSync(gratisFolder) && fs.lstatSync(gratisFolder).isDirectory()) {
                    const commandFiles = fs.readdirSync(gratisFolder).filter((file) => file.endsWith(".ts"));

                    if (commandFiles.length > 0) {
                        const commandList = commandFiles.map((file) => `\`/${path.parse(file).name}\``).join(", ");

                        // Capitalize the folder name for the field title
                        const categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
                        embed.addFields({ name: `🛠️ ${categoryName}`, value: commandList });
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
