const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");
const OrderSchema = require("../../../models/OrderSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin-orden")
        .setDescription("Gestiona las órdenes de cashback de los usuarios.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand.setName("panel").setDescription("Muestra el panel de gestión de órdenes pendientes.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("pagar")
                .setDescription("Marca una orden como pagada.")
                .addStringOption((option) =>
                    option.setName("id").setDescription("ID de la orden a pagar.").setRequired(true)
                )
        ),

    async execute(client, interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "panel") {
            const orders = await OrderSchema.find({ guildId: interaction.guild.id, status: "pendiente" }).limit(25);

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
                    name: `📦 Orden #${order.id.toString().slice(-6)}`,
                    value: `**Usuario:** ${order.userName}\n**Monto:** $${order.totalValue} | **Items:** ${order.quantity}`
                });

                selectMenu.addOptions({
                    label: `Orden #${order.id.toString().slice(-6)} - ${order.userName}`,
                    description: `Valor: $${order.totalValue} | Items: ${order.quantity}`,
                    value: order.id.toString()
                });
            });

            const row = new ActionRowBuilder().addComponents(selectMenu);

            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        if (subcommand === "pagar") {
            const id = interaction.options.getString("id");
            const order = await OrderSchema.findById(id);

            if (!order) {
                return interaction.reply({ content: "❌ No se encontró ninguna orden con ese ID.", ephemeral: true });
            }

            if (order.status !== "aprobada") {
                return interaction.reply({
                    content: `⚠️ Solo puedes pagar órdenes **aprobadas**. Estado actual: **${order.status}**.`,
                    ephemeral: true
                });
            }

            order.status = "pagada";
            order.paidAt = new Date();
            await order.save();

            const embed = new EmbedBuilder()
                .setTitle("💰 Pago Registrado")
                .setDescription(`La orden \`${order.id}\` de **${order.userName}** ha sido marcada como **PAGADA**.`)
                .setColor("Green")
                .addFields({ name: "Monto Neto", value: `$${order.netPayout.toFixed(2)}` });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        return null;
    }
};
