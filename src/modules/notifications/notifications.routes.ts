import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { createUserNotification, createAdminNotification } from './notifications.controller';

const router = Router();

/**
 * @route POST /api/notifications
 * @desc Crear una notificación para todos los usuarios conectados.
 * Fire-and-forget: no se persiste en la base de datos.
 * @access Private (requiere usuario autenticado)
 * @param req.body.message {string} Mensaje de la notificación
 * @param req AuthenticatedRequest con `user.id`
 * @param res Respuesta con objeto de confirmación: { message: string }
 * @example
 * POST /api/notifications
 * {
 *   "message": "Nuevo producto disponible"
 * }
 */
router.post('/', authenticate, createUserNotification);

/**
 * @route POST /api/notifications/admin
 * @desc Crear una notificación solo para administradores conectados.
 * Fire-and-forget: no se persiste en la base de datos.
 * @access Private (requiere usuario autenticado y rol admin)
 * @param req.body.message {string} Mensaje de la notificación
 * @param req AuthenticatedRequest con `user.id`
 * @param res Respuesta con objeto de confirmación: { message: string }
 * @example
 * POST /api/notifications/admin
 * {
 *   "message": "Nueva orden pendiente de aprobación"
 * }
 */
router.post('/admin', authenticate, authorize('admin'), createAdminNotification);

export default router;
