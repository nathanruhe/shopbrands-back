import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// Extraemos variables de entorno
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, PORT, JWT_SECRET, BASE_URL: ENV_BASE_URL } = process.env;

// Validamos que estén definidas
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME || !JWT_SECRET) {
    throw new Error("❌ Faltan variables de entorno obligatorias. Revisa tu .env");
}

// Puerto en el que correrá el servidor
export const SERVER_PORT: number = Number(PORT) || 3000;

// Clave secreta usada para firmar JWT
export const JWT_KEY: string = JWT_SECRET;

// URL base de la aplicación, para construir URLs completas y rutas a recursos estáticos
export const BASE_URL: string = ENV_BASE_URL || `http://localhost:${SERVER_PORT}`;

// Pool de conexión a MySQL usando mysql2/promise
export const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT) || 3306,
    connectionLimit: 10,
});
