import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/**
 * Obtiene el perfil del usuario autenticado.
 *
 * @async
 * @function getProfile
 * @param {AuthenticatedRequest} req - Solicitud HTTP con `user.id` disponible (añadido por el middleware `authenticate`).
 * @param {Response} res - Respuesta HTTP con los datos del usuario autenticado.
 * @returns {Promise<void>} Envía el perfil del usuario en formato JSON.
 * @throws {Error} Si el usuario no existe o la consulta falla.
 *
 * @example
 * // GET /api/users/profile
 * res.json({
 *   id: 3,
 *   first_name: "Juan",
 *   last_name: "Pérez",
 *   email: "juan@example.com"
 * });
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await UsersService.getProfile(req.user!.id);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualiza el perfil del usuario autenticado.
 *
 * @async
 * @function updateProfile
 * @param {AuthenticatedRequest} req - Solicitud HTTP con `user.id` y cuerpo JSON con campos a modificar.
 * @param {Response} res - Respuesta HTTP con el usuario actualizado.
 * @returns {Promise<void>} Envía el usuario actualizado en formato JSON.
 * @throws {Error} Si el usuario no existe o la actualización falla.
 *
 * @example
 * // PUT /api/users/profile
 * req.body = { first_name: "Carlos" }
 * res.json({ id: 3, first_name: "Carlos", last_name: "Pérez", email: "juan@example.com" });
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const updatedUser = await UsersService.updateProfile(req.user!.id, req.body);
        res.json(updatedUser);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtiene todos los usuarios del sistema (solo para administradores).
 *
 * @async
 * @function getAllUsers
 * @param {Request} req - Solicitud HTTP.
 * @param {Response} res - Respuesta HTTP con el listado completo de usuarios.
 * @returns {Promise<void>} Envía un arreglo de usuarios en formato JSON.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 *
 * @example
 * // GET /api/users
 * res.json([{ id: 1, email: "admin@example.com" }, { id: 2, email: "user@example.com" }]);
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UsersService.getAllUsers();
        res.json(users);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Elimina la cuenta del usuario autenticado.
 *
 * @async
 * @function deleteOwnAccount
 * @param {AuthenticatedRequest} req - Solicitud HTTP con `user.id` del usuario actual.
 * @param {Response} res - Respuesta HTTP con mensaje de confirmación.
 * @returns {Promise<void>} Envía un mensaje confirmando la eliminación.
 * @throws {Error} Si el usuario no existe o la eliminación falla.
 *
 * @example
 * // DELETE /api/users/me
 * res.json({ message: "Usuario con ID 5 eliminado correctamente" });
 */
export const deleteOwnAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await UsersService.deleteUserById(req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtiene un usuario específico por su ID (solo para administradores).
 *
 * @async
 * @function getUserById
 * @param {Request} req - Solicitud HTTP con parámetro `id`.
 * @param {Response} res - Respuesta HTTP con los datos del usuario encontrado.
 * @returns {Promise<void>} Envía el usuario correspondiente en formato JSON.
 * @throws {Error} Si el usuario no existe.
 *
 * @example
 * // GET /api/users/7
 * res.json({ id: 7, email: "usuario7@example.com" });
 */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await UsersService.getUserById(Number(req.params.id));
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualiza un usuario específico por su ID (solo para administradores).
 *
 * @async
 * @function updateUserById
 * @param {Request} req - Solicitud HTTP con parámetro `id` y cuerpo JSON con campos a actualizar.
 * @param {Response} res - Respuesta HTTP con el usuario actualizado.
 * @returns {Promise<void>} Envía el usuario actualizado en formato JSON.
 * @throws {Error} Si el usuario no existe o la actualización falla.
 *
 * @example
 * // PUT /api/users/10
 * req.body = { email: "nuevo@example.com" }
 * res.json({ id: 10, email: "nuevo@example.com" });
 */
export const updateUserById = async (req: Request, res: Response) => {
    try {
        const updatedUser = await UsersService.updateUserById(Number(req.params.id), req.body);
        res.json(updatedUser);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Elimina un usuario específico por su ID (solo para administradores).
 *
 * @async
 * @function deleteUserById
 * @param {Request} req - Solicitud HTTP con parámetro `id`.
 * @param {Response} res - Respuesta HTTP con mensaje de confirmación.
 * @returns {Promise<void>} Envía un mensaje de eliminación exitosa.
 * @throws {Error} Si el usuario no existe o la eliminación falla.
 *
 * @example
 * // DELETE /api/users/9
 * res.json({ message: "Usuario con ID 9 eliminado correctamente" });
 */
export const deleteUserById = async (req: Request, res: Response) => {
    try {
        const result = await UsersService.deleteUserById(Number(req.params.id));
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};



