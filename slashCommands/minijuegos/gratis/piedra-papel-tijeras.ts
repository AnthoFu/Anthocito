/* eslint-disable max-len */
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    ChatInputCommandInteraction,
    ComponentType,
    ButtonInteraction
} from "discord.js";

export default {
    name: "piedra-papel-tijeras", // Nombre del comando
    description: "Prueba tu suerte jugando el clásico piedra, papel o tijeras",

    // Descripción

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        // Crear un Embed para las instrucciones del juego
        const embed = new EmbedBuilder()
            .setColor(0x00ae86)
            .setTitle("Piedra, Papel o Tijeras")
            .setDescription("¡Selecciona tu opción!");

        // Crear los botones con los emojis 🪨, 📄, ✂️
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("piedra").setLabel("🪨").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("papel").setLabel("📄").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("tijeras").setLabel("✂️").setStyle(ButtonStyle.Primary)
        );

        // Enviar el mensaje con el Embed y los botones
        await interaction.reply({ embeds: [embed], components: [row] });

        // Definir las opciones posibles para el bot
        const opcionesBot = ["piedra", "papel", "tijeras"];

        // Esperar la interacción del usuario con un límite de tiempo de 10 segundos
        try {
            const filter = (i: ButtonInteraction) => i.user.id === interaction.user.id;
            // Filtrar para que solo el usuario que ejecutó el comando pueda responder
            const userChoice = await interaction.channel!.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 10000
            });

            // Elección aleatoria del bot
            const botChoice = opcionesBot[Math.floor(Math.random() * opcionesBot.length)];

            // Mostrar la elección del bot
            await userChoice.update({
                content: `Has elegido ${userChoice.customId} y el yo elijo... ¡*${botChoice}*!`,
                components: []
            });

            // Comparar las elecciones y decidir el resultado
            if (userChoice.customId === botChoice) {
                await interaction.followUp("¡Empate! ¿Jugamos otra vez? :3");
            } else if (
                (userChoice.customId === "piedra" && botChoice === "tijeras") ||
                (userChoice.customId === "papel" && botChoice === "piedra") ||
                (userChoice.customId === "tijeras" && botChoice === "papel")
            ) {
                await interaction.followUp("¡Ganaste! Rayos...");
            } else {
                await interaction.followUp("¡Perdiste! Muejejeje >:3");
            }
        } catch (_error: unknown) {
            console.error("Error en piedra-papel-tijeras:", _error);
            // Si se agota el tiempo sin que el usuario elija
            await interaction.editReply({
                content: "Eh... ¿Hola? ¿Sigues ahí? Se te acabo el tiempo... ¡Tontito!",
                components: []
            });
        }
    }
};
/* eslint-enable max-len */
