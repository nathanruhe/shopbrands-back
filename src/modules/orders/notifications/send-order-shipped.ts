import { mailService } from '../../../integrations/mail.service';
import { OrderData } from '../invoice/invoice.service';

/**
 * Envía un correo al cliente notificando que su pedido ha sido **enviado**.
 *
 * Flujo:
 * 1. Utiliza `mailService.sendMail` para enviar el correo.
 * 2. Usa la plantilla `order-shipped`.
 * 3. Incluye en el contexto la información del pedido y, si existe, el número de seguimiento.
 *
 * @param {OrderData} order - Información completa del pedido enviado (incluye datos del usuario).
 * @param {string} [trackingNumber] - Número de seguimiento del envío (opcional).
 * @returns {Promise<void>} No retorna valor, solo envía el correo.
 * @throws {Error} Puede lanzar error si falla el envío del correo.
 *
 * @example
 * ```ts
 * await sendOrderShippedEmail(order, 'BRN123456789ES');
 * ```
 */
export const sendOrderShippedEmail = async (order: OrderData, trackingNumber?: string) => {
    try {
        await mailService.sendMail({
            to: order.user.email,
            subject: `Tu pedido #${order.id} ha sido enviado`,
            template: 'order-shipped',
            context: { order, trackingNumber },
        });
        console.log(`✅ Email de envío enviado a ${order.user.email}`);
    } catch (err) {
        console.error('❌ Error enviando email de envío:', err);
    }
};
