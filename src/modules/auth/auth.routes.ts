import { Router } from 'express';
import { login, register, changePassword, requestPasswordReset, resetPassword } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * Registrar un nuevo usuario.
 * Ruta: POST /api/auth/register
 * 
 * @route POST /api/auth/register
 * @access Public
 * @async
 * @param {Request} req - Objeto Request de Express.
 * @param {Object} req.body - Datos del usuario a registrar.
 * @param {string} req.body.first_name - Nombre del usuario.
 * @param {string} req.body.last_name - Apellido del usuario.
 * @param {string} req.body.email - Email del usuario. Debe ser único.
 * @param {string} req.body.password - Contraseña en texto plano.
 * @param {'user'|'admin'} req.body.role - Rol del usuario.
 * @param {string} req.body.phone - Número de teléfono del usuario.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Responde con JSON que contiene un mensaje de éxito o error.
 * @throws {400} Si ya existe un usuario con el mismo email o ocurre otro error de validación.
 * @example
 * // POST /api/auth/register
 * // Body: { first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com', password: '123456', role: 'user', phone: '555-1234' }
 */
router.post('/register', register);

/**
 * Iniciar sesión de usuario o administrador.
 * Ruta: POST /api/auth/login
 * 
 * @route POST /api/auth/login
 * @access Public
 * @async
 * @param {Request} req - Objeto Request de Express.
 * @param {Object} req.body - Datos de login del usuario.
 * @param {string} req.body.email - Email del usuario.
 * @param {string} req.body.password - Contraseña en texto plano.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Responde con JSON que contiene el JWT y los datos del usuario sin la contraseña.
 * @throws {400} Si el usuario no existe o la contraseña es incorrecta.
 * @example
 * // POST /api/auth/login
 * // Body: { email: 'juan@example.com', password: '123456' }
 * // Response: { token: 'JWT_TOKEN', user: { id: 1, first_name: 'Juan', ... } }
 */
router.post('/login', login);

/**
 * Cambiar la contraseña del usuario autenticado.
 * 
 * @route PUT /api/auth/change-password
 * @access Private (requiere autenticación con token)
 * @async
 * @middleware authenticate - Verifica el token JWT y agrega los datos del usuario a la request.
 * @param {AuthenticatedRequest} req - Request con datos del usuario autenticado (`req.user`).
 * @param {Object} req.body - Cuerpo de la petición con las contraseñas.
 * @param {string} req.body.current_password - Contraseña actual del usuario.
 * @param {string} req.body.new_password - Nueva contraseña a establecer.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Devuelve un JSON con un mensaje de éxito.
 * @throws {400} Si la contraseña actual es incorrecta o hay errores de validación.
 * 
 * @example
 * // PUT /api/auth/change-password
 * {
 *   "current_password": "123456",
 *   "new_password": "nueva789"
 * }
 */
router.put('/change-password', authenticate, changePassword);

/**
 * Solicitar recuperación de contraseña (enviar email con token).
 * 
 * @route POST /api/auth/forgot-password
 * @access Public
 * @async
 * @param {Request} req - Objeto Request de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.email - Email del usuario que solicita recuperar la contraseña.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Devuelve un mensaje de confirmación de envío del correo.
 * @throws {400} Si el email no existe o hay un error al generar/enviar el token.
 * 
 * @example
 * // POST /api/auth/forgot-password
 * {
 *   "email": "juan@example.com"
 * }
 * // Response:
 * { "message": "Se ha enviado un correo con las instrucciones para restablecer la contraseña." }
 */
router.post('/forgot-password', requestPasswordReset);

/**
 * Restablecer la contraseña mediante un token válido.
 * 
 * @route POST /api/auth/reset-password
 * @access Public
 * @async
 * @param {Request} req - Objeto Request de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.token - Token recibido por email.
 * @param {string} req.body.new_password - Nueva contraseña del usuario.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Devuelve un mensaje de confirmación del restablecimiento.
 * @throws {400} Si el token es inválido o ha expirado.
 * 
 * @example
 * // POST /api/auth/reset-password
 * {
 *   "token": "abcd1234efgh5678",
 *   "new_password": "nuevaPassword123"
 * }
 * // Response:
 * { "message": "Contraseña restablecida correctamente." }
 */
router.post('/reset-password', resetPassword);

export default router;
