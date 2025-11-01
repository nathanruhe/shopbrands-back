import { db } from '../../config/config';
import { GET_USER_BY_ID, UPDATE_USER_BY_ID, GET_ALL_USERS, DELETE_USER_BY_ID } from '../../database/queries/users.queries';

export const UsersService = {
    /**
     * Obtiene el perfil de un usuario específico por su ID.
     * 
     * @async
     * @function getProfile
     * @param {number} userId - ID del usuario a consultar.
     * @returns {Promise<Object>} Datos del usuario encontrado.
     * @throws {Error} Si el usuario no existe.
     * 
     * @example
     * const user = await UsersService.getProfile(15);
     */
    async getProfile(userId: number) {
        const [rows]: any = await db.query(GET_USER_BY_ID, [userId]);
        if (!rows.length) throw new Error('Usuario no encontrado');
        return rows[0];
    },

    /**
     * Actualiza parcialmente el perfil del usuario autenticado.
     * Solo actualiza los campos enviados en el objeto `updates`.
     * 
     * @async
     * @function updateProfile
     * @param {number} userId - ID del usuario a actualizar.
     * @param {Object} updates - Campos a modificar.
     * @param {string} [updates.first_name] - Nombre del usuario.
     * @param {string} [updates.last_name] - Apellido del usuario.
     * @param {string} [updates.email] - Correo electrónico.
     * @param {string} [updates.phone] - Teléfono de contacto.
     * @returns {Promise<Object>} Usuario actualizado.
     * @throws {Error} Si el usuario no existe.
     */
    async updateProfile(userId: number, updates: any) {
        // Obtener datos actuales del usuario
        const [rows]: any = await db.query(GET_USER_BY_ID, [userId]);
        if (!rows.length) throw new Error('Usuario no encontrado');

        const user = rows[0];

        // Merge con los campos enviados
        const updatedUser = {
            first_name: updates.first_name ?? user.first_name,
            last_name: updates.last_name ?? user.last_name,
            email: updates.email ?? user.email,
            phone: updates.phone ?? user.phone,
        };

        // Ejecutar actualización en la DB
        await db.query(UPDATE_USER_BY_ID, [
            updatedUser.first_name,
            updatedUser.last_name,
            updatedUser.email,
            updatedUser.phone,
            userId
        ]);

        // Retornar usuario actualizado
        const [updatedRows]: any = await db.query(GET_USER_BY_ID, [userId]);
        return updatedRows[0];
    },

    /**
     * Obtiene la lista completa de usuarios registrados.
     * Solo accesible por administradores.
     * 
     * @async
     * @function getAllUsers
     * @returns {Promise<Object[]>} Lista de todos los usuarios del sistema.
     * 
     * @example
     * const users = await UsersService.getAllUsers();
     */
    async getAllUsers() {
        const [rows]: any = await db.query(GET_ALL_USERS);
        return rows;
    },

    /**
     * Obtiene un usuario por su identificador único.
     * Solo accesible por administradores.
     * 
     * @async
     * @function getUserById
     * @param {number} id - ID del usuario a consultar.
     * @returns {Promise<Object>} Datos del usuario.
     * @throws {Error} Si el usuario no se encuentra.
     */
    async getUserById(id: number) {
        const [rows]: any = await db.query(GET_USER_BY_ID, [id]);
        if (!rows.length) throw new Error('Usuario no encontrado');
        return rows[0];
    },

    /**
     * Actualiza completamente los datos de un usuario específico.
     * Permite modificar cualquier campo editable (nombre, apellido, email, teléfono).
     * Solo accesible por administradores.
     * 
     * @async
     * @function updateUserById
     * @param {number} id - ID del usuario a modificar.
     * @param {Object} updates - Campos a actualizar.
     * @param {string} [updates.first_name] - Nuevo nombre.
     * @param {string} [updates.last_name] - Nuevo apellido.
     * @param {string} [updates.email] - Nuevo correo electrónico.
     * @param {string} [updates.phone] - Nuevo teléfono.
     * @returns {Promise<Object>} Usuario actualizado.
     * @throws {Error} Si el usuario no existe.
     */
    async updateUserById(id: number, updates: any) {
        const [rows]: any = await db.query(GET_USER_BY_ID, [id]);
        if (!rows.length) throw new Error('Usuario no encontrado');
        const user = rows[0];

        const updatedUser = {
            first_name: updates.first_name ?? user.first_name,
            last_name: updates.last_name ?? user.last_name,
            email: updates.email ?? user.email,
            phone: updates.phone ?? user.phone,
        };

        await db.query(UPDATE_USER_BY_ID, [
            updatedUser.first_name,
            updatedUser.last_name,
            updatedUser.email,
            updatedUser.phone,
            id
        ]);

        const [updatedRows]: any = await db.query(GET_USER_BY_ID, [id]);
        return updatedRows[0];
    },

    /**
     * Elimina un usuario del sistema por su ID.
     * Puede ser ejecutado por un administrador o el propio usuario.
     * 
     * @async
     * @function deleteUserById
     * @param {number} id - ID del usuario a eliminar.
     * @returns {Promise<{message: string}>} Mensaje de confirmación.
     * @throws {Error} Si el usuario no existe.
     * 
     * @example
     * const result = await UsersService.deleteUserById(7);
     * console.log(result.message); // Usuario con ID 7 eliminado correctamente
     */
    async deleteUserById(id: number) {
        const [rows]: any = await db.query(GET_USER_BY_ID, [id]);
        if (!rows.length) throw new Error('Usuario no encontrado');
        await db.query(DELETE_USER_BY_ID, [id]);
        return { message: `Usuario con ID ${id} eliminado correctamente` };
    }
};
