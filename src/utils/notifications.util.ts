import { notificationsService } from '../modules/notifications/notifications.service';

/**
 * @function notifyAdminNewOrder
 * @summary Envía una notificación a los administradores cuando un usuario realiza un pedido.
 * @description
 * Llama internamente a `notificationsService.createNotificationForAdmin()` para registrar
 * una notificación dirigida a los administradores del sistema.
 *
 * Este método es **asíncrono no bloqueante** (no usa `await`), por lo que no interrumpe
 * el flujo de ejecución principal.
 *
 * @param {number} orderId - ID del pedido recién creado.
 * @param {number} userId - ID del usuario que realizó el pedido.
 *
 * @example
 * ```ts
 * notifyAdminNewOrder(123, 45);
 * // => Notifica a los administradores: "Nuevo pedido realizado por el usuario 45. ID del pedido: 123"
 * ```
 */
export const notifyAdminNewOrder = (orderId: number, userId: number) => {
    // Fire-and-forget: no await porque no necesitamos bloquear
    try {
        notificationsService.createNotificationForAdmin(
            `Nuevo pedido realizado por el usuario ${userId}. ID del pedido: ${orderId}`
        );
    } catch (e) {
        console.warn('Error enviando notificación admin new order:', e);
    }
};

/**
 * @function notifyAdminPaymentReceived
 * @summary Envía una notificación a los administradores cuando se recibe un pago.
 * @description
 * Informa a los administradores del sistema que un pedido ha sido pagado con éxito.
 * Este proceso no interrumpe la ejecución principal y se maneja de forma silenciosa
 * si ocurre un error.
 *
 * @param {number} orderId - ID del pedido para el que se ha recibido el pago.
 *
 * @example
 * ```ts
 * notifyAdminPaymentReceived(321);
 * // => Notifica a los administradores: "Pago recibido para el pedido 321"
 * ```
 */
export const notifyAdminPaymentReceived = (orderId: number) => {
    try {
        notificationsService.createNotificationForAdmin(
            `Pago recibido para el pedido ${orderId}`
        );
    } catch (e) {
        console.warn('Error enviando notificación admin payment received:', e);
    }
};

/**
 * @function notifyUsersNewProduct
 * @summary Envía una notificación general a todos los usuarios cuando hay un nuevo producto.
 * @description
 * Informa a todos los usuarios registrados sobre la disponibilidad de un nuevo producto
 * o promoción. Se ejecuta de forma no bloqueante.
 *
 * @param {string} message - Mensaje de la notificación que se enviará a los usuarios.
 *
 * @example
 * ```ts
 * notifyUsersNewProduct('¡Nuevo producto disponible: Sudadera edición limitada!');
 * ```
 */
export const notifyUsersNewProduct = (message: string) => {
    try {
        notificationsService.createNotificationForUsers(message);
    } catch (e) {
        console.warn('Error enviando notificación users new product:', e);
    }
};
