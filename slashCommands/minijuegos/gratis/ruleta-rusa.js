/*Este comando actualmente no funciona correctamente */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "ruletarusa",
    description: "Invita a otro jugador a jugar ruleta rusa",
    options: [
        {
            name: "jugador",
            description: "Elige al jugador con quien quieres jugar",
            type: 6,  // Tipo de opción para mencionar usuarios
            required: true
        }
    ],

    async execute(client, interaction) {
        const jugador1 = interaction.user;
        const jugador2 = interaction.options.getUser("jugador");

        if (jugador1.id === jugador2.id) {
            return interaction.reply({ content: "¡No puedes jugar contra ti mismo!", ephemeral: true });
        }

        // Crear botones de aceptar o rechazar el juego
        const aceptarBoton = new ButtonBuilder()
            .setCustomId('aceptar')
            .setLabel('Aceptar juego')
            .setStyle(ButtonStyle.Success);

        const rechazarBoton = new ButtonBuilder()
            .setCustomId('rechazar')
            .setLabel('Rechazar juego')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(aceptarBoton, rechazarBoton);

        await interaction.reply({
            content: `${jugador2}, ${jugador1} te ha invitado a jugar a la Ruleta Rusa. ¿Aceptas?`,
            components: [row]
        });

        const filter = i => i.user.id === jugador2.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'aceptar') {
                await i.update({ content: `¡El juego ha comenzado entre ${jugador1} y ${jugador2}!`, components: [] });
                iniciarJuego(interaction, jugador1, jugador2);
            } else if (i.customId === 'rechazar') {
                await i.update({ content: `El jugador ${jugador2} ha rechazado el juego.`, components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: `El jugador ${jugador2} no respondió a tiempo.`, components: [] });
            }
        });
    }
};

// Función para inicializar el juego y gestionar los turnos
async function iniciarJuego(interaction, jugador1, jugador2) {
    // Inicializar las vidas de ambos jugadores
    let vidas = {
        [jugador1.id]: 3,
        [jugador2.id]: 3
    };

    let turnoDe = Math.random() < 0.5 ? jugador1 : jugador2;  // Elige un jugador al azar para empezar
    let balaEnRecamara = Math.floor(Math.random() * 6) + 1;  // Posición de la bala en la recámara
    let posicionActual = Math.floor(Math.random() * 6) + 1;

    await interaction.followUp({
        content: `¡El jugador ${turnoDe.username} comienza el juego! Tiene 3 vidas.`,
    });

    // Empieza el ciclo de turnos
    cicloDeTurnos(interaction, jugador1, jugador2, turnoDe, vidas, balaEnRecamara, posicionActual);
}

// Función para gestionar el ciclo de turnos
async function cicloDeTurnos(interaction, jugador1, jugador2, turnoDe, vidas, balaEnRecamara, posicionActual, obligarDisparo = false) {
    const oponente = turnoDe.id === jugador1.id ? jugador2 : jugador1;

    // Crear las opciones de turno
    const boton1 = new ButtonBuilder()
        .setCustomId('dispararse')
        .setLabel('Apuntarse y dispararse')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(obligarDisparo); // Deshabilitado si el disparo es obligatorio después de fallar

    const boton2 = new ButtonBuilder()
        .setCustomId('dispararOponente')
        .setLabel(`Disparar a ${oponente.username}`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(obligarDisparo); // Deshabilitar disparar al oponente si debe dispararse a sí mismo

    const boton3 = new ButtonBuilder()
        .setCustomId('girar')
        .setLabel('Girar la recámara')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(obligarDisparo); // Deshabilitar girar si debe dispararse a sí mismo

    const row = new ActionRowBuilder().addComponents(boton1, boton2, boton3);

    // Si el jugador está obligado a dispararse después de fallar, indicamos el motivo
    const mensajeAccion = obligarDisparo
        ? `${turnoDe.username}, has fallado al disparar a ${oponente.username}, y ahora **debes dispararte a ti mismo**.`
        : `${turnoDe.username}, es tu turno. ¿Qué acción deseas realizar?`;

    await interaction.followUp({
        content: mensajeAccion,
        components: [row]
    });

    const filter = i => i.user.id === turnoDe.id;  // Solo el jugador actual puede interactuar
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 10000 });

    collector.on('collect', async i => {
        // Deferir la interacción dentro del tiempo límite para evitar que expire
        await i.deferUpdate();  // Esto asegura que no se excedan los 3 segundos

        if (i.customId === 'dispararse' || obligarDisparo) {
            // El jugador se dispara a sí mismo
            if (posicionActual === balaEnRecamara) {
                vidas[turnoDe.id]--;
                await interaction.followUp({
                    content: `¡Oh no! ${turnoDe.username} se disparó y perdió una vida. Ahora tiene ${vidas[turnoDe.id]} vidas.`,
                    components: []
                });
            } else {
                await interaction.followUp({
                    content: `¡${turnoDe.username} se disparó, pero sobrevivió!`,
                    components: []
                });
            }
        } else if (i.customId === 'dispararOponente') {
            // Acción de disparar al oponente
            if (posicionActual === balaEnRecamara) {
                vidas[oponente.id]--;
                await interaction.followUp({
                    content: `¡${turnoDe.username} disparó a ${oponente.username} y le quitó una vida! ${oponente.username} ahora tiene ${vidas[oponente.id]} vidas.`,
                    components: []
                });
            } else {
                await interaction.followUp({
                    content: `${turnoDe.username} falló al disparar a ${oponente.username}, y ahora **debe dispararse a sí mismo**.`,
                    components: []
                });
                // Obligamos al jugador a dispararse a sí mismo en el próximo turno
                return cicloDeTurnos(interaction, jugador1, jugador2, turnoDe, vidas, balaEnRecamara, posicionActual, true);
            }
        } else if (i.customId === 'girar') {
            // Acción de girar la recámara
            posicionActual = Math.floor(Math.random() * 6) + 1;
            await interaction.followUp({
                content: `${turnoDe.username} giró la recámara. ¡La posición de la bala ha cambiado!`,
                components: []
            });
        }

        // Comprobamos si ambos jugadores han perdido todas sus vidas (empate)
        if (vidas[jugador1.id] === 0 && vidas[jugador2.id] === 0) {
            await interaction.followUp({
                content: `¡Ambos jugadores han perdido todas sus vidas! ¡Es un empate!`,
                components: []
            });
            return;
        }

        // Comprobamos si algún jugador perdió todas las vidas
        if (vidas[jugador1.id] === 0 || vidas[jugador2.id] === 0) {
            const ganador = vidas[jugador1.id] > 0 ? jugador1 : jugador2;
            await interaction.followUp({
                content: `¡El juego ha terminado! ${ganador.username} ha ganado.`,
                components: []
            });
            return;
        }

        // Cambiar el turno al otro jugador si no han perdido
        turnoDe = turnoDe.id === jugador1.id ? jugador2 : jugador1;
        cicloDeTurnos(interaction, jugador1, jugador2, turnoDe, vidas, balaEnRecamara, posicionActual);
    });

    collector.on('end', async collected => {
        if (collected.size === 0) {
            await interaction.followUp({
                content: `${turnoDe.username} no respondió a tiempo. Pierde una vida.`,
                components: []
            });
            vidas[turnoDe.id]--;  // El jugador que no respondió pierde una vida

            // Comprobamos si ambos jugadores han perdido todas sus vidas (empate)
            if (vidas[jugador1.id] === 0 && vidas[jugador2.id] === 0) {
                await interaction.followUp({
                    content: `¡Ambos jugadores han perdido todas sus vidas! ¡Es un empate!`,
                    components: []
                });
                return;
            }

            // Comprobamos si algún jugador perdió todas las vidas
            if (vidas[jugador1.id] === 0 || vidas[jugador2.id] === 0) {
                const ganador = vidas[jugador1.id] > 0 ? jugador1 : jugador2;
                await interaction.followUp({
                    content: `¡El juego ha terminado! ${ganador.username} ha ganado.`,
                    components: []
                });
                return;
            }

            // Cambiar el turno al otro jugador si no han perdido
            turnoDe = turnoDe.id === jugador1.id ? jugador2 : jugador1;
            cicloDeTurnos(interaction, jugador1, jugador2, turnoDe, vidas, balaEnRecamara, posicionActual);
        }
    });
}
