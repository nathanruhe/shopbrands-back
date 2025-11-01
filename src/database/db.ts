import { db } from '../config/config';

/**
 * Ejecuta una consulta SQL usando el pool de MySQL configurado.
 *
 * @template T Tipo esperado de los resultados de la consulta (opcional)
 * @param {string} sql Consulta SQL a ejecutar
 * @param {any[]} [params=[]] Parámetros opcionales para la consulta
 * @returns {Promise<T[]>} Promise que resuelve con los resultados tipados
 * @throws {Error} Si la consulta falla
 *
 * @example
 * ```ts
 * const users = await query<User>('SELECT * FROM users WHERE role = ?', ['admin']);
 * ```
 */
export const query = async (sql: string, params: any[] = []) => {
    try {
        const [rows] = await db.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("❌ Error en query:", error);
        throw error;
    }
};