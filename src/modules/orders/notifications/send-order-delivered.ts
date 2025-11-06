import { mailService } from '../../../integrations/mail.service';
import { OrderData } from '../invoice/invoice.service';

/**
 * Envía un correo al cliente notificando que su pedido ha sido **entregado**.
 *
 * Flujo:
 * 1. Utiliza `mailService.sendMail` para enviar el correo.
 * 2. Usa la plantilla `order-delivered`.
 * 3. Incluye en el contexto la información del pedido (nombre, id, total, etc.).
 *
 * @param {OrderData} order - Información completa del pedido entregado (incluye datos del usuario).
 * @returns {Promise<void>} No retorna valor, solo envía el correo.
 * @throws {Error} Puede lanzar error si falla el envío del correo.
 *
 * @example
 * ```ts
 * await sendOrderDeliveredEmail(order);
 * ```
 */
export const sendOrderDeliveredEmail = async (order: OrderData) => {
    try {
        await mailService.sendMail({
            to: order.user.email,
            subject: `Tu pedido #${order.id} ha sido entregado 🎉`,
            template: 'order-delivered',
            context: { order },
        });
        console.log(`✅ Email de entrega enviado a ${order.user.email}`);
    } catch (err) {
        console.error('❌ Error enviando email de entrega:', err);
    }
};
