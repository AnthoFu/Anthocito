const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const OrderSchema = require("../../models/OrderSchema");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const [action, type, id] = interaction.customId.split("_");
        // type might be '40', '30' or the ID itself if action is 'rechazar'

        let orderId;
        if (action === "rechazar") {
            orderId = type; // En este caso customId es rechazar_ID
        } else {
            orderId = id; // En este caso customId es aprobar_TYPE_ID
        }

        const order = await OrderSchema.findById(orderId);
        if (!order) {
            await interaction.reply({ content: "No se encontró la orden.", ephemeral: true });
            return;
        }

        if (action === "aprobar") {
            let cashback;
            let commission;
            let netPayout;
            let collaboratorCommission = 0;

            if (type === "40") {
                cashback = order.totalValue * 0.4;
                commission = 8 * order.quantity;
                netPayout = cashback - commission;

                // Si hay colaborador, reservamos una parte de la comisión (ej: $2 por item)
                if (order.collaboratorId || order.collaboratorName) {
                    collaboratorCommission = 2 * order.quantity;
                }
            } else if (type === "30") {
                cashback = order.totalValue * 0.3;
                commission = 0;
                netPayout = cashback;
            }

            order.cashback = cashback;
            order.commission = commission;
            order.netPayout = netPayout;
            order.collaboratorCommission = collaboratorCommission;
            order.status = "aprobada";
            order.approvedAt = new Date();

            await order.save();

            const embed = new EmbedBuilder()
                .setTitle("✅ Orden Aprobada")
                .setColor("Green")
                .setDescription(`La orden de **${order.userName}** ha sido aprobada.`)
                .addFields(
                    { name: "Cashback", value: `$${cashback.toFixed(2)}`, inline: true },
                    { name: "Comisión", value: `$${commission.toFixed(2)}`, inline: true },
                    { name: "Neto a Pagar", value: `$${netPayout.toFixed(2)}`, inline: true }
                );

            if (collaboratorCommission > 0) {
                embed.addFields({
                    name: "Comisión Colaborador",
                    value: `$${collaboratorCommission.toFixed(2)} (${order.collaboratorName})`,
                    inline: false
                });
            }

            embed.setFooter({ text: "El usuario será notificado" });

            await interaction.update({ embeds: [embed], components: [] });

            // Notificar al usuario (opcional)
            try {
                const user = await client.users.fetch(order.userId);
                await user.send({
                    content: `🎉 ¡Tu orden de cashback ha sido **aprobada**!\n**Monto Neto:** $${netPayout.toFixed(2)}\nEl pago se procesará en un máximo de 72 horas.`
                });
            } catch (err) {
                console.log(`No se pudo enviar MD al usuario ${order.userId}`);
            }
        }

        if (action === "rechazar") {
            const modal = new ModalBuilder().setCustomId(`modal_rechazar_${order.id}`).setTitle("Rechazar Orden");

            const reasonInput = new TextInputBuilder()
                .setCustomId("razon_rechazo")
                .setLabel("Motivo del Rechazo")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Ej: La factura no es legible o los datos no coinciden.")
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

            await interaction.showModal(modal);
        }
    }
};
