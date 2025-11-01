import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    deleteOwnAccount,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from './users.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /users/me
 * @summary Obtiene el perfil del usuario actualmente autenticado
 * @description Devuelve los datos del usuario logueado según el token JWT.
 * @access Private
 * @middleware authenticate
 * @returns {Object} Perfil del usuario
 *
 * @example
 * // GET /api/users/me
 * res.json({
 *   id: 12,
 *   first_name: "María",
 *   last_name: "Gómez",
 *   email: "maria@example.com"
 * });
 */
router.get('/me', authenticate, getProfile);

/**
 * @route PUT /users/me
 * @summary Actualiza el perfil del usuario actualmente autenticado
 * @description Permite al usuario modificar sus propios datos.
 * @access Private
 * @middleware authenticate
 * @body {string} [first_name] - Nombre del usuario
 * @body {string} [last_name] - Apellido del usuario
 * @body {string} [email] - Correo electrónico
 * @body {string} [phone] - Teléfono
 *
 * @example
 * // PUT /api/users/me
 * req.body = { first_name: "Ana", phone: "555-1234" }
 * res.json({ id: 12, first_name: "Ana", phone: "555-1234" });
 */
router.put('/me', authenticate, updateProfile);

/**
 * @route DELETE /users/me
 * @summary Elimina la cuenta del usuario autenticado
 * @description Elimina permanentemente la cuenta del usuario que hace la petición.
 * @access Private
 * @middleware authenticate
 * @returns {Object} Mensaje de confirmación
 *
 * @example
 * // DELETE /api/users/me
 * res.json({ message: "Usuario con ID 12 eliminado correctamente" });
 */
router.delete('/me', authenticate, deleteOwnAccount);

/**
 * @route GET /users
 * @summary Lista todos los usuarios registrados en el sistema
 * @description Devuelve un listado completo de usuarios. Solo accesible por administradores.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @returns {Array<Object>} Lista de usuarios
 *
 * @example
 * // GET /api/users
 * res.json([
 *   { id: 1, email: "admin@example.com" },
 *   { id: 2, email: "usuario@example.com" }
 * ]);
 */
router.get('/', authenticate, authorize('admin'), getAllUsers);

/**
 * @route GET /users/:id
 * @summary Obtiene los datos de un usuario específico
 * @description Devuelve los datos del usuario con el ID indicado. Solo para administradores.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID del usuario
 * @returns {Object} Datos del usuario
 *
 * @example
 * // GET /api/users/5
 * res.json({ id: 5, email: "user5@example.com" });
 */
router.get('/:id', authenticate, authorize('admin'), getUserById);

/**
 * @route PUT /users/:id
 * @summary Actualiza los datos de un usuario específico
 * @description Permite a un administrador modificar los datos de un usuario.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID del usuario a actualizar
 * @body {string} [first_name] - Nuevo nombre
 * @body {string} [last_name] - Nuevo apellido
 * @body {string} [email] - Nuevo correo electrónico
 * @body {string} [phone] - Nuevo teléfono
 * @returns {Object} Usuario actualizado
 *
 * @example
 * // PUT /api/users/8
 * req.body = { email: "nuevo@example.com" }
 * res.json({ id: 8, email: "nuevo@example.com" });
 */
router.put('/:id', authenticate, authorize('admin'), updateUserById);

/**
 * @route DELETE /users/:id
 * @summary Elimina un usuario por su ID
 * @description Elimina permanentemente un usuario específico. Solo accesible por administradores.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID del usuario a eliminar
 * @returns {Object} Mensaje de confirmación
 *
 * @example
 * // DELETE /api/users/9
 * res.json({ message: "Usuario con ID 9 eliminado correctamente" });
 */
router.delete('/:id', authenticate, authorize('admin'), deleteUserById);

export default router;