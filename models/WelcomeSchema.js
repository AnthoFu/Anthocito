const mongoose = require("mongoose");

const WelcomeSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, default: null },
    message: { type: String, default: "¡Bienvenido {user} a nuestro servidor!" },
    enabled: { type: Boolean, default: false },
});

module.exports = mongoose.model("Welcome", WelcomeSchema);
