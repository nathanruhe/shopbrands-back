import { notificationsGateway } from './notifications.gateway';

/**
 * Servicio simple para emitir notificaciones en tiempo real mediante WebSockets.
 * - No persiste datos en la base de datos.
 * - Fire-and-forget: envía la notificación sin esperar confirmación de entrega.
 */
export const notificationsService = {
    /**
     * Enviar una notificación a todos los usuarios conectados.
     * @param message {string} Mensaje de la notificación
     * @returns {{ message: string }} Mensaje de confirmación de envío
     * @example
     * notificationsService.createNotificationForUsers("Nuevo producto disponible");
     */
    createNotificationForUsers(message: string) {
        // sendToAll es síncrono y no necesita await
        notificationsGateway.sendToAll(message);
        return { message: 'Notificación enviada a usuarios' };
    },

    /**
     * Enviar una notificación únicamente a administradores conectados.
     * @param message {string} Mensaje de la notificación
     * @returns {{ message: string }} Mensaje de confirmación de envío
     * @example
     * notificationsService.createNotificationForAdmin("Nueva orden pendiente de aprobación");
     */
    createNotificationForAdmin(message: string) {
        notificationsGateway.sendToAdmins(message);
        return { message: 'Notificación enviada a admins' };
    },
};
