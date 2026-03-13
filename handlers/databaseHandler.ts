import mongoose from "mongoose";

/**
 * Función para cargar y conectar a la base de datos de MongoDB
 */
export async function loadDatabase() {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        console.warn(" | [MongoDB] No se ha proporcionado una MONGODB_URI en el archivo .env.");
    }

    try {
        await mongoose.connect(mongoURI!);
        console.log(" | [MongoDB] ¡Conexión exitosa a la base de datos! :D ");
    } catch (err) {
        console.error(` | [MongoDB] Error al conectar a la base de datos :( => ${err}`);
    }
}
