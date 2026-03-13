import { Schema, model, Document } from "mongoose";

export interface IWelcome extends Document {
    guildId: string;
    channelId: string;
    message: string;
    enabled: boolean;
}

const WelcomeSchema = new Schema<IWelcome>({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, default: null },
    message: { type: String, default: "¡Bienvenido {user} a nuestro servidor!" },
    enabled: { type: Boolean, default: false }
});

export default model<IWelcome>("Welcome", WelcomeSchema);
