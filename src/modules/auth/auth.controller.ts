import { Request, Response } from 'express';
import { AuthService } from './auth.service';

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
