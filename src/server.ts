import app from './app';
import dotenv from 'dotenv';
import { db } from './config/config';
import { notificationsGateway } from './modules/notifications/notifications.gateway'; // 🔹 Importar gateway

// Cargar variables de entorno desde .env
dotenv.config();

// Puerto del servidor (por defecto 3000)
const PORT = process.env.PORT || 3000;

/**
 * Función autoejecutable para iniciar el servidor
 * Verifica conexión a la base de datos antes de levantar Express
 */
(async () => {
    try {
        // Probar conexión a la base de datos
        await db.query("SELECT 1");
        console.log("✅ Conectado a la base de datos MySQL");

        // Iniciar servidor Express y guardar referencia del server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });

        // Inicializar WebSocket de notificaciones
        notificationsGateway.init(server);
        console.log('🔔 Notifications WebSocket inicializado');

    } catch (error) {
        console.error("❌ No se pudo conectar a la base de datos:", error);
        process.exit(1);
    }
})();
