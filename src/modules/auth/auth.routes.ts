import { Router } from 'express';
import { login, register } from './auth.controller';

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

export default router;
