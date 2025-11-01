import { Response } from 'express';
import { notificationsService } from './notifications.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/**
 * Crear una notificación para todos los usuarios conectados.
 * Fire-and-forget: no se persiste en la base de datos.
 * @route POST /api/notifications
 * @access Private (requiere usuario autenticado)
 * @param req.body.message {string} Mensaje de la notificación
 * @param req AuthenticatedRequest con `user.id`
 * @param res Respuesta con objeto de confirmación: { message: string }
 * @returns {Promise<void>}
 * @example
 * POST /api/notifications
 * {
 *   "message": "Nuevo producto disponible"
 * }
*/
export const createUserNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }

        const result = notificationsService.createNotificationForUsers(message);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Crear una notificación solo para administradores conectados.
 * Fire-and-forget: no se persiste en la base de datos.
 * @route POST /api/notifications/admin
 * @access Private (requiere usuario autenticado y rol admin)
 * @param req.body.message {string} Mensaje de la notificación
 * @param req AuthenticatedRequest con `user.id`
 * @param res Respuesta con objeto de confirmación: { message: string }
 * @returns {Promise<void>}
 * @example
 * POST /api/notifications/admin
 * {
 *   "message": "Nueva orden pendiente de aprobación"
 * }
*/
export const createAdminNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }

        const result = notificationsService.createNotificationForAdmin(message);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

