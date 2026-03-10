import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Client,
    ChatInputCommandInteraction
} from "discord.js";
import OrderSchema, { IOrder } from "../../../models/OrderSchema";

export default {
    data: new SlashCommandBuilder()
        .setName("admin-orden")
        .setDescription("Gestiona las órdenes de cashback de los usuarios.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand.setName("panel").setDescription("Muestra el panel de gestión de órdenes pendientes.")
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("panel-pagos").setDescription("Muestra el panel para pagar órdenes aprobadas.")
        ),

    async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "panel") {
            const orders: IOrder[] = await OrderSchema.find({
                guildId: interaction.guild!.id,
                status: "pendiente"
            }).limit(25);

            if (orders.length === 0) {
                return interaction.reply({ content: "No hay órdenes pendientes por ahora. ✨", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle("🛠️ Panel de Control: Órdenes Pendientes")
                .setDescription("Selecciona una orden del menú de abajo para gestionarla (Aprobar/Rechazar).")
                .setColor("DarkVividPink")
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("seleccionar_orden_gestionar")
                .setPlaceholder("Elige una orden para gestionar...");

            orders.forEach((order) => {
                embed.addFields({
                    name: `📦 Orden #${order._id.toString().slice(-6)}`,
                    value: `**Usuario:** ${order.userName}\n**Monto:** $${order.totalValue} | **Items:** ${
                        order.quantity
                    }`
                });

                selectMenu.addOptions({
                    label: `Orden #${order._id.toString().slice(-6)} - ${order.userName}`,
                    description: `Valor: $${order.totalValue} | Items: ${order.quantity}`,
                    value: order._id.toString()
                });
            });

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        if (subcommand === "panel-pagos") {
            const orders: IOrder[] = await OrderSchema.find({
                guildId: interaction.guild!.id,
                status: "aprobada"
            }).limit(25);

            if (orders.length === 0) {
                return interaction.reply({
                    content: "No hay órdenes aprobadas pendientes de pago. ✅",
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("💵 Panel de Pagos: Órdenes Aprobadas")
                .setDescription("Selecciona una orden del menú para marcarla como **pagada**.")
                .setColor("Gold")
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("seleccionar_orden_pagar")
                .setPlaceholder("Elige una orden para pagar...");

            orders.forEach((order) => {
                embed.addFields({
                    name: `✅ Orden #${order._id.toString().slice(-6)}`,
                    value: `**Usuario:** ${order.userName}\n**Neto a Pagar:** $${order.netPayout.toFixed(2)}`
                });

                selectMenu.addOptions({
                    label: `Orden #${order._id.toString().slice(-6)} - ${order.userName}`,
                    description: `Neto a Pagar: $${order.netPayout.toFixed(2)}`,
                    value: order._id.toString()
                });
            });

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        return null;
    }
};
