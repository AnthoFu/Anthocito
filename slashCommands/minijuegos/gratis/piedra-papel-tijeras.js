const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js"); // Importar componentes necesarios

module.exports = {
	name: "piedra-papel-tijeras", // Nombre del comando
	description: "Prueba tu suerte jugando el clásico piedra, papel o tijeras con Anthocito", // Descripción

	async execute(client, interaction) {
		// Crear un Embed para las instrucciones del juego
		const embed = new EmbedBuilder()
			.setColor(0x00AE86)
			.setTitle("Piedra, Papel o Tijeras")
			.setDescription("¡Selecciona tu opción!");

		// Crear los botones con los emojis 🪨, 📄, ✂️
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('piedra')
					.setLabel('🪨')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('papel')
					.setLabel('📄')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('tijeras')
					.setLabel('✂️')
					.setStyle(ButtonStyle.Primary)
			);

		// Enviar el mensaje con el Embed y los botones
		await interaction.reply({ embeds: [embed], components: [row] });

		// Definir las opciones posibles para el bot
		const opcionesBot = ['piedra', 'papel', 'tijeras'];

		// Esperar la interacción del usuario con un límite de tiempo de 10 segundos
		try {
			const filter = i => i.user.id === interaction.user.id; // Filtrar para que solo el usuario que ejecutó el comando pueda responder
			const userChoice = await interaction.channel.awaitMessageComponent({ filter, time: 10000 });

			// Elección aleatoria del bot
			const botChoice = opcionesBot[Math.floor(Math.random() * opcionesBot.length)];

			// Mostrar la elección del bot
			await userChoice.update({ content: `Has elegido ${userChoice.customId} y el yo elijo... ¡*${botChoice}*!`, components: [] });

			// Comparar las elecciones y decidir el resultado
			if (userChoice.customId === botChoice) {
				await interaction.followUp("¡Empate! ¿Jugamos otra vez? :3");
			} else if (
				(userChoice.customId === 'piedra' && botChoice === 'tijeras') ||
				(userChoice.customId === 'papel' && botChoice === 'piedra') ||
				(userChoice.customId === 'tijeras' && botChoice === 'papel')
			) {
				await interaction.followUp("¡Ganaste! Rayos...");
			} else {
				await interaction.followUp("¡Perdiste! Muejejeje >:3");
			}
		} catch (error) {
			// Si se agota el tiempo sin que el usuario elija
			await interaction.editReply({ content: "Eh... ¿Hola? ¿Sigues ahí? Se te acabo el tiempo... ¡Tontito!", components: [] });
		}
		console.log(` | Se ha utilizado el comando ${this.name}`)
	}
};
