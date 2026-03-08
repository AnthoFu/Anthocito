const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const OrderSchema = require("../../../models/OrderSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("orden")
        .setDescription("Gestiona tus órdenes de cashback.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("nueva")
                .setDescription("Registra una nueva orden de compra para cashback.")
                .addStringOption((option) =>
                    option.setName("fecha").setDescription("Fecha de la orden (DD/MM/AAAA)").setRequired(true)
                )
                .addIntegerOption((option) =>
                    option.setName("cantidad").setDescription("Cantidad de items comprados").setRequired(true)
                )
                .addNumberOption((option) =>
                    option.setName("valor").setDescription("Valor total de la orden").setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("colaborador")
                        .setDescription("Menciona al colaborador (opcional)")
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("mis-ordenes").setDescription("Muestra el estado de tus órdenes actuales.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("vouch")
                .setDescription("Confirma que has recibido tu pago.")
                .addStringOption((option) =>
                    option
                        .setName("comentario")
                        .setDescription("Un breve comentario sobre el servicio.")
                        .setRequired(false)
                )
        ),

    async execute(client, interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "nueva") {
            const fecha = interaction.options.getString("fecha");
            const cantidad = interaction.options.getInteger("cantidad");
            const valor = interaction.options.getNumber("valor");
            const colaboradorRaw = interaction.options.getString("colaborador");

            let collaboratorId = null;
            let collaboratorName = null;

            if (colaboradorRaw) {
                const mentionMatch = colaboradorRaw.match(/<@!?(\d+)>/);
                if (mentionMatch) {
                    [, collaboratorId] = mentionMatch;
                } else if (/^\d+$/.test(colaboradorRaw)) {
                    collaboratorId = colaboradorRaw;
                } else {
                    collaboratorName = colaboradorRaw;
                }

                if (collaboratorId && !collaboratorName) {
                    try {
                        const colabUser = await client.users.fetch(collaboratorId);
                        collaboratorName = colabUser.tag;
                    } catch (e) {
                        collaboratorName = `ID: ${collaboratorId}`;
                    }
                }
            }

            const newOrder = new OrderSchema({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                userName: interaction.user.tag,
                orderDate: fecha,
                quantity: cantidad,
                totalValue: valor,
                collaboratorId,
                collaboratorName,
                status: "pendiente"
            });

            await newOrder.save();

            const embed = new EmbedBuilder()
                .setTitle("✅ Orden Registrada")
                .setDescription(`<@${interaction.user.id}> ha registrado una nueva orden. Pendiente de aprobación.`)
                .addFields(
                    { name: "ID de la Orden", value: `\`${newOrder.id}\``, inline: true },
                    { name: "Fecha", value: fecha, inline: true },
                    { name: "Items", value: cantidad.toString(), inline: true },
                    { name: "Valor Total", value: `$${valor}`, inline: true }
                )
                .setColor("Green")
                .setTimestamp();

            if (collaboratorName) {
                embed.addFields({ name: "Colaborador", value: collaboratorName, inline: true });
            }

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "mis-ordenes") {
            const orders = await OrderSchema.find({ userId: interaction.user.id, guildId: interaction.guild.id })
                .sort({ createdAt: -1 })
                .limit(5);

            if (orders.length === 0) {
                return interaction.reply({ content: "No tienes ninguna orden registrada.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📝 Órdenes de ${interaction.user.tag}`)
                .setColor("Blue")
                .setTimestamp();

            orders.forEach((order) => {
                const statusEmoji = {
                    pendiente: "⏳",
                    aprobada: "✅",
                    pagada: "💰",
                    finalizada: "🏁",
                    rechazada: "❌"
                };

                embed.addFields({
                    name: `Orden #${order.id.toString().slice(-6)} - ${statusEmoji[order.status]} ${order.status.toUpperCase()}`,
                    value: `**Fecha:** ${order.orderDate}\n**Items:** ${order.quantity}\n**Valor:** $${order.totalValue}\n**Neto:** ${order.status === "pendiente" ? "Por calcular" : `$${order.netPayout}`}\n**ID:** \`${order.id}\``
                });
            });

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "vouch") {
            const ordersToVouch = await OrderSchema.find({
                userId: interaction.user.id,
                status: "pagada"
            });

            if (ordersToVouch.length === 0) {
                return interaction.reply({
                    content: "No tienes órdenes pagadas para hacer un vouch.",
                    ephemeral: true
                });
            }

            const options = ordersToVouch.map((order) => ({
                label: `Orden #${order.id.toString().slice(-6)}`,
                description: `Valor: $${order.totalValue}, Pagado: $${order.netPayout.toFixed(2)}`,
                value: `vouch_${order.id}`
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("vouch_select_menu")
                .setPlaceholder("Selecciona una orden para hacer el vouch")
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            return interaction.reply({
                content: "Tienes las siguientes órdenes listas para hacer vouch. Por favor, selecciona una:",
                components: [row],
                ephemeral: true
            });
        }

        return null;
    }
};
