const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    orderDate: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    collaboratorId: { type: String, default: null },
    collaboratorName: { type: String, default: null },
    collaboratorCommission: { type: Number, default: 0 },
    cashback: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    netPayout: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["pendiente", "aprobada", "pagada", "finalizada", "rechazada"],
        default: "pendiente"
    },
    createdAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    rejectionReason: { type: String }
});

module.exports = mongoose.model("Order", OrderSchema);
