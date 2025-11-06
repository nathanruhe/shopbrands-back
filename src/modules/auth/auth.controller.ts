import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/**
 * Controlador para registrar un nuevo usuario.
 * Ruta: POST /api/auth/register
 * 
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
 * @returns {Promise<void>} Responde con JSON que contiene un mensaje de éxito.
 * @throws {400} Si ya existe un usuario con el mismo email o ocurre otro error de validación.
 * 
 * @example
 * // POST /api/auth/register
 * // Body: { first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com', password: '123456', role: 'user', phone: '555-1234' }
 * await register(req, res);
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, email, password, role, phone } = req.body;
        const result = await AuthService.register(first_name, last_name, email, password, role, phone);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Controlador para login de usuario/admin.
 * Ruta: POST /api/auth/login
 * 
 * @async
 * @param {Request} req - Objeto Request de Express.
 * @param {Object} req.body - Datos de login del usuario.
 * @param {string} req.body.email - Email del usuario.
 * @param {string} req.body.password - Contraseña en texto plano.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Responde con JSON que contiene el JWT y los datos del usuario sin la contraseña.
 * @throws {400} Si el usuario no existe o la contraseña es incorrecta.
 * 
 * @example
 * // POST /api/auth/login
 * // Body: { email: 'juan@example.com', password: '123456' }
 * const result = await login(req, res);
 * console.log(result.token); // JWT
 * console.log(result.user); // { id: 1, first_name: 'Juan', ... }
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Controlador: Cambio de contraseña (usuario autenticado).
 * Ruta: `PUT /api/auth/change-password`
 * 
 * Flujo:
 * 1. Verifica que el usuario esté autenticado mediante middleware.
 * 2. Comprueba la contraseña actual.
 * 3. Actualiza la contraseña con la nueva.
 * 
 * @async
 * @param {AuthenticatedRequest} req - Request con datos del usuario autenticado (`req.user`).
 * @param {Object} req.body - Contraseñas proporcionadas por el usuario.
 * @param {string} req.body.current_password - Contraseña actual.
 * @param {string} req.body.new_password - Nueva contraseña.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Devuelve un mensaje JSON de confirmación.
 * @throws {400} Si la contraseña actual es incorrecta o el usuario no existe.
 * 
 * @example
 * // PUT /api/auth/change-password
 * {
 *   "current_password": "123456",
 *   "new_password": "nueva789"
 * }
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { current_password, new_password } = req.body;
        const result = await AuthService.changePassword(userId, current_password, new_password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Controlador: Solicitud de recuperación de contraseña (Forgot Password).
 * Ruta: `POST /api/auth/request-password-reset`
 * 
 * Flujo:
 * 1. Verifica si el email existe en la base de datos.
 * 2. Genera un token de recuperación con caducidad.
 * 3. Envía un email con el enlace para restablecer la contraseña.
 * 
 * @async
 * @param {Request} req - Objeto Request de Express.
 * @param {Object} req.body - Contiene el email del usuario.
 * @param {string} req.body.email - Email registrado del usuario.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Devuelve un mensaje de confirmación del envío.
 * @throws {400} Si el email no existe o hay errores al enviar el correo.
 * 
 * @example
 * // POST /api/auth/request-password-reset
 * {
 *   "email": "juan@example.com"
 * }
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const result = await AuthService.requestPasswordReset(email);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Controlador: Restablecer contraseña con token.
 * Ruta: `POST /api/auth/reset-password`
 * 
 * Flujo:
 * 1. Recibe el token y la nueva contraseña desde el cuerpo de la petición.
 * 2. Verifica que el token sea válido y no haya expirado.
 * 3. Actualiza la contraseña y elimina el token de la base de datos.
 * 
 * @async
 * @param {Request} req - Objeto Request de Express.
 * @param {Object} req.body - Datos para restablecer la contraseña.
 * @param {string} req.body.token - Token de recuperación.
 * @param {string} req.body.new_password - Nueva contraseña a establecer.
 * @param {Response} res - Objeto Response de Express.
 * @returns {Promise<void>} Devuelve un mensaje JSON de confirmación.
 * @throws {400} Si el token es inválido o ha expirado.
 * 
 * @example
 * // POST /api/auth/reset-password
 * {
 *   "token": "abcd1234efgh5678",
 *   "new_password": "nuevaPassword123"
 * }
 */
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, new_password } = req.body;
        const result = await AuthService.resetPassword(token, new_password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
