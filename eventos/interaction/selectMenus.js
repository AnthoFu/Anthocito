const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");
const OrderSchema = require("../../models/OrderSchema");

module.exports = {
    name: "interactionCreate",

    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId === "seleccionar_orden_gestionar") {
            const orderId = interaction.values[0];
            const order = await OrderSchema.findById(orderId);

            if (!order) {
                await interaction.reply({ content: "Esta orden ya no existe.", ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("🔎 Gestión de Orden")
                .setDescription(`Detalles de la orden de **${order.userName}**`)
                .addFields(
                    { name: "ID", value: `\`${order.id}\``, inline: true },
                    { name: "Fecha", value: order.orderDate, inline: true },
                    { name: "Items", value: order.quantity.toString(), inline: true },
                    { name: "Valor Total", value: `$${order.totalValue}`, inline: true }
                )
                .setColor("Blue");

            if (order.collaboratorName) {
                embed.addFields({ name: "Colaborador", value: `${order.collaboratorName}`, inline: false });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`aprobar_40_${order.id}`)
                    .setLabel("Aprobar (40% - Com)")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`aprobar_30_${order.id}`)
                    .setLabel("Aprobar (30% Flat)")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`rechazar_${order.id}`)
                    .setLabel("Rechazar")
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        } else if (interaction.customId === "vouch_select_menu") {
            const selectedValue = interaction.values[0];
            const orderId = selectedValue.split("_")[1];

            const modal = new ModalBuilder().setCustomId(`vouch_modal_${orderId}`).setTitle("Finalizar Vouch");

            const commentInput = new TextInputBuilder()
                .setCustomId("vouch_comment")
                .setLabel("Comentario del Vouch")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("¡Pago recibido correctamente! Gracias.")
                .setRequired(false);

            const firstActionRow = new ActionRowBuilder().addComponents(commentInput);
            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }
    }
};
