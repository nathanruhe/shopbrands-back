import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from '../utils/jwt.util';

/**
 * Extiende el Request de Express para incluir información del usuario autenticado
 */
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

/**
 * @middleware authenticate
 * @summary Middleware de autenticación JWT
 * @description
 * Verifica la validez del token JWT presente en el encabezado `Authorization`.
 * Si es válido, agrega la información del usuario (`req.user`) y permite el acceso al siguiente middleware.
 *
 * Si el token falta o es inválido, responde con código **401 Unauthorized**.
 *
 * @param {AuthenticatedRequest} req - Objeto de solicitud, potencialmente con `user`
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - Función para continuar con el siguiente middleware
 *
 * @returns {void}
 *
 * @example
 * // Encabezado requerido:
 * Authorization: Bearer <token>
 *
 * // Ejemplo de uso:
 * router.get('/profile', authenticate, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token inválido' });

    try {
        const decoded = verifyJwt<JwtPayload>(token);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

/**
 * @middleware authorize
 * @summary Middleware de autorización basado en rol
 * @description
 * Verifica que el usuario autenticado posea el rol requerido para acceder al recurso.
 * 
 * Si el usuario no está autenticado o no tiene el rol necesario, responde con **403 Forbidden**.
 *
 * @param {string} role - Rol requerido para acceder (por ejemplo `"admin"` o `"user"`)
 * @returns {Function} Middleware de Express que valida el rol del usuario
 *
 * @example
 * // Permitir solo a administradores:
 * router.delete('/users/:id', authenticate, authorize('admin'), deleteUserById);
 *
 * // Permitir solo a usuarios normales:
 * router.get('/orders', authenticate, authorize('user'), getUserOrders);
 */
export const authorize = (role: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) return res.status(403).json({ message: 'No autorizado' });
        if (user.role !== role) return res.status(403).json({ message: 'No tienes permisos' });
        next();
    };
};

