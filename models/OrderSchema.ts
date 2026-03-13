import { Schema, model, Document } from "mongoose";

export interface IOrder extends Document {
    guildId: string;
    userId: string;
    userName: string;
    orderDate: string;
    quantity: number;
    totalValue: number;
    collaboratorId?: string;
    collaboratorName?: string;
    collaboratorCommission?: number;
    cashback?: number;
    commission?: number;
    netPayout: number;
    status: "pendiente" | "aprobada" | "pagada" | "finalizada" | "rechazada";
    createdAt: Date;
    approvedAt?: Date;
    paidAt?: Date;
    rejectionReason?: string;
}

const OrderSchema = new Schema<IOrder>({
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

export default model<IOrder>("Order", OrderSchema);
