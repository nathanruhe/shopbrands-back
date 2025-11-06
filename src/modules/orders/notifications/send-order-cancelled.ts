import { mailService } from '../../../integrations/mail.service';

/**
 * Envía un correo al cliente notificando que su pedido ha sido **cancelado** y, si corresponde, **reembolsado**.
 *
 * Flujo:
 * 1. Utiliza `mailService.sendMail` para enviar el correo.
 * 2. Usa la plantilla `order-cancelled`.
 * 3. Incluye en el contexto la información del pedido, usuario y monto reembolsado.
 *
 * @param {Object} user - Información del usuario que recibirá el correo.
 * @param {string} user.email - Correo electrónico del usuario.
 * @param {string} [user.first_name] - Nombre del usuario (opcional).
 * @param {Object} order - Información del pedido cancelado.
 * @param {number} order.id - ID del pedido.
 * @param {number} [refundedAmount=0] - Monto reembolsado al cliente (por defecto 0).
 * @returns {Promise<void>} No retorna valor, solo envía el correo.
 * @throws {Error} Puede lanzar error si falla el envío del correo.
 *
 * @example
 * ```ts
 * await sendOrderCancelledEmail(
 *   { email: 'user@mail.com', first_name: 'María' },
 *   { id: 456 },
 *   59.99
 * );
 * ```
 */
export const sendOrderCancelledEmail = async (user: { email: string, first_name?: string }, order: { id: number }, refundedAmount: number = 0) => {
    try {
        await mailService.sendMail({
            to: user.email,
            subject: `Tu pedido #${order.id} ha sido cancelado`,
            template: 'order-cancelled',
            context: { order, user, refundedAmount },
        });
        console.log(`✅ Email cancelación enviado a ${user.email}`);
    } catch (err) {
        console.error('❌ Error enviando email cancelación:', err);
    }
};
