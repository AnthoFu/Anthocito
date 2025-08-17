const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
//! Este código todavía esta en desarrollo


// Usaremos un Map para almacenar el estado de los juegos activos en cada canal.
const activeGames = new Map();

module.exports = {
    name: "ruletarusa",
    description: "Inicia un juego de ruleta rusa al que otros pueden unirse.",

    async execute(client, interaction) {
        // Comprobar si ya hay un juego en este canal
        if (activeGames.has(interaction.channel.id)) {
            return interaction.reply({ content: "Ya hay un juego de Ruleta Rusa en curso en este canal.", ephemeral: true });
        }

        const host = interaction.user;
        const players = new Map(); // Usaremos un Map para evitar duplicados fácilmente
        players.set(host.id, host);

        const embed = new EmbedBuilder()
            .setTitle("🔫 Ruleta Rusa")
            .setColor("#C70039")
            .setDescription(`¡**${host.username}** ha iniciado una partida de Ruleta Rusa!\n\nHaz clic en **"Unirse"** para participar.\nEl anfitrión puede comenzar el juego en cualquier momento.`)
            .addFields({ name: "Jugadores (1)", value: host.username });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_rr').setLabel("Unirse").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('start_rr').setLabel("Comenzar Partida").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cancel_rr').setLabel("Cancelar").setStyle(ButtonStyle.Danger)
        );

        const message = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true });

        const game = {
            hostId: host.id,
            players: players,
            interaction: interaction,
            message: message,
            collector: null,
        };
        activeGames.set(interaction.channel.id, game);

        const collector = message.createMessageComponentCollector({ time: 300000 }); // 5 minutos para iniciar
        game.collector = collector;

        collector.on('collect', async i => {
            // Solo el anfitrión puede iniciar o cancelar
            if (i.customId === 'start_rr' || i.customId === 'cancel_rr') {
                if (i.user.id !== host.id) {
                    return i.reply({ content: "Solo el anfitrión de la partida puede realizar esta acción.", ephemeral: true });
                }
            }

            switch (i.customId) {
                case 'join_rr':
                    if (players.has(i.user.id)) {
                        return i.reply({ content: "Ya estás en la partida.", ephemeral: true });
                    }
                    players.set(i.user.id, i.user);
                    const playerUsernames = Array.from(players.values()).map(p => p.username).join('\n');
                    embed.setFields({ name: `Jugadores (${players.size})`, value: playerUsernames });
                    await i.update({ embeds: [embed] });
                    break;

                case 'start_rr':
                    if (players.size < 2) {
                        return i.reply({ content: "Se necesitan al menos 2 jugadores para comenzar.", ephemeral: true });
                    }
                    collector.stop();
                    await i.update({ content: "La partida va a comenzar...", components: [] });
                    startGame(game);
                    break;

                case 'cancel_rr':
                    collector.stop();
                    embed.setDescription("La partida ha sido cancelada por el anfitrión.").setColor("#581845").setFields([]);
                    await i.update({ embeds: [embed], components: [] });
                    activeGames.delete(interaction.channel.id);
                    break;
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                embed.setDescription("La partida no comenzó a tiempo y fue cancelada.").setColor("#581845").setFields([]);
                interaction.editReply({ embeds: [embed], components: [] });
                activeGames.delete(interaction.channel.id);
            }
        });
    }
};

async function startGame(game) {
    const { interaction, players } = game;
    
    let playerArray = Array.from(players.values());
    // Barajar jugadores para un orden aleatorio
    for (let i = playerArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playerArray[i], playerArray[j]] = [playerArray[j], playerArray[i]];
    }

    game.players = playerArray;
    game.currentPlayerIndex = 0;
    game.chamberPosition = 1;
    game.bulletPosition = Math.floor(Math.random() * 6) + 1;

    const embed = new EmbedBuilder()
        .setTitle("🔫 ¡Que comience el juego!")
        .setColor("#F1C40F");

    await interaction.followUp({ embeds: [embed] });
    nextTurn(game);
}

async function nextTurn(game) {
    if (game.players.length === 1) {
        const winner = game.players[0];
        const endEmbed = new EmbedBuilder()
            .setTitle("🏆 Fin del Juego")
            .setDescription(`¡**${winner.username}** es el último superviviente y gana la partida!`)
            .setColor("#2ECC71");
        
        await game.message.edit({ embeds: [endEmbed], components: [] });
        activeGames.delete(game.interaction.channel.id);
        return;
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    const playerList = game.players.map(p => `> ${p.id === currentPlayer.id ? '▶️' : '👤'} ${p.username}`).join('\n');

    const turnEmbed = new EmbedBuilder()
        .setTitle("🔫 Ruleta Rusa")
        .setColor("#F1C40F")
        .setDescription(`Es el turno de **${currentPlayer.username}**.\n\n*El revólver se pasa de mano en mano...*

*El revólver se pasa de mano en mano...*`)
        .addFields({ name: "Jugadores restantes", value: playerList });

    const turnButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pull_trigger').setLabel("Jalar el gatillo").setStyle(ButtonStyle.Danger)
    );

    await game.message.edit({ embeds: [turnEmbed], components: [turnButton] });

    const filter = (i) => i.customId === 'pull_trigger' && i.user.id === currentPlayer.id;
    const collector = game.message.createMessageComponentCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async i => {
        await i.deferUpdate();

        const resultEmbed = new EmbedBuilder().setTitle("🔫 Ruleta Rusa");
        
        if (game.chamberPosition === game.bulletPosition) {
            // ¡BANG! Jugador eliminado
            const eliminatedPlayer = game.players.splice(game.currentPlayerIndex, 1)[0];
            resultEmbed
                .setColor("#E74C3C")
                .setDescription(`**¡BANG!**\n\n**${eliminatedPlayer.username}** ha sido eliminado.`);
            
            // Reiniciar la recámara para la siguiente ronda
            game.bulletPosition = Math.floor(Math.random() * game.players.length) + 1;
            game.chamberPosition = 1;

        } else {
            // Click... El jugador sobrevive
            resultEmbed
                .setColor("#3498DB")
                .setDescription(`**Click...**\n\n**${currentPlayer.username}** sobrevive. El revólver pasa al siguiente.`);
            game.chamberPosition++;
            game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        }
        
        // Asegurarse de que el índice no se salga de los límites si alguien fue eliminado
        if (game.currentPlayerIndex >= game.players.length) {
            game.currentPlayerIndex = 0;
        }

        await game.message.channel.send({ embeds: [resultEmbed] });
        
        // Pausa dramática antes del siguiente turno
        setTimeout(() => nextTurn(game), 3000);
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            const eliminatedPlayer = game.players.splice(game.currentPlayerIndex, 1)[0];
            const timeoutEmbed = new EmbedBuilder()
                .setTitle("⏰ ¡Tiempo agotado!")
                .setColor("#E74C3C")
                .setDescription(`**${eliminatedPlayer.username}** no actuó a tiempo y ha sido eliminado por cobarde.`);
            
            game.message.channel.send({ embeds: [timeoutEmbed] });
            
            // Asegurarse de que el índice no se salga de los límites
            if (game.currentPlayerIndex >= game.players.length) {
                game.currentPlayerIndex = 0;
            }

            setTimeout(() => nextTurn(game), 3000);
        }
    });
}