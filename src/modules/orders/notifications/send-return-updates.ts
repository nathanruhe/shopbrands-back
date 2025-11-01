import { mailService } from '../../../integrations/mail.service';

/**
 * Envía un correo al cliente notificando que su solicitud de devolución ha sido **aprobada**.
 *
 * Flujo:
 * 1. Utiliza `mailService.sendMail` para enviar el correo.
 * 2. Usa la plantilla `return-approved`.
 * 3. Incluye en el contexto la información del pedido y del usuario.
 *
 * @param {Object} user - Información del usuario que recibirá el correo.
 * @param {string} user.email - Correo electrónico del usuario.
 * @param {string} [user.first_name] - Nombre del usuario (opcional).
 * @param {string} [user.last_name] - Apellido del usuario (opcional).
 * @param {Object} order - Información del pedido relacionado con la devolución.
 * @param {number} order.id - ID del pedido.
 * @returns {Promise<void>} No retorna valor, solo envía el correo.
 * @throws {Error} Puede lanzar error si falla el envío del correo.
 * 
 * @example
 * ```ts
 * await sendReturnApprovedEmail({ email: 'user@mail.com', first_name: 'Juan' }, { id: 123 });
 * ```
 */
export const sendReturnApprovedEmail = async (user: { email: string, first_name?: string, last_name?: string }, order: { id: number }) => {
    try {
        await mailService.sendMail({
            to: user.email,
            subject: `Respuesta solicitud de devolución pedido #${order.id}`,
            template: 'return-approved',
            context: { order, user },
        });
        console.log(`✅ Email de devolución aprobada enviado a ${user.email}`);
    } catch (error) {
        console.error('❌ Error enviando email de devolución aprobada:', error);
    }
};

/**
 * Envía un correo al cliente notificando que su solicitud de devolución ha sido **rechazada**.
 *
 * Flujo:
 * 1. Utiliza `mailService.sendMail` para enviar el correo.
 * 2. Usa la plantilla `return-rejected`.
 * 3. Incluye en el contexto la información del pedido y del usuario.
 *
 * @param {Object} user - Información del usuario que recibirá el correo.
 * @param {string} user.email - Correo electrónico del usuario.
 * @param {string} [user.first_name] - Nombre del usuario (opcional).
 * @param {string} [user.last_name] - Apellido del usuario (opcional).
 * @param {Object} order - Información del pedido relacionado con la devolución.
 * @param {number} order.id - ID del pedido.
 * @returns {Promise<void>} No retorna valor, solo envía el correo.
 * @throws {Error} Puede lanzar error si falla el envío del correo.
 */
export const sendReturnRejectedEmail = async (user: { email: string, first_name?: string, last_name?: string }, order: { id: number }) => {
    try {
        await mailService.sendMail({
            to: user.email,
            subject: `Respuesta solicitud de devolución pedido #${order.id}`,
            template: 'return-rejected',
            context: { order, user },
        });
        console.log(`✅ Email de devolución rechazada enviado a ${user.email}`);
    } catch (error) {
        console.error('❌ Error enviando email de devolución rechazada:', error);
    }
};

/**
 * Envía un correo al cliente notificando que su devolución ha sido **completada y reembolsada**.
 *
 * Flujo:
 * 1. Utiliza `mailService.sendMail` para enviar el correo.
 * 2. Usa la plantilla `return-completed`.
 * 3. Incluye en el contexto la información del pedido y del usuario.
 *
 * @param {Object} user - Información del usuario que recibirá el correo.
 * @param {string} user.email - Correo electrónico del usuario.
 * @param {string} [user.first_name] - Nombre del usuario (opcional).
 * @param {string} [user.last_name] - Apellido del usuario (opcional).
 * @param {Object} order - Información del pedido relacionado con la devolución.
 * @param {number} order.id - ID del pedido.
 * @returns {Promise<void>} No retorna valor, solo envía el correo.
 * @throws {Error} Puede lanzar error si falla el envío del correo.
 */
export const sendReturnCompletedEmail = async (user: { email: string, first_name?: string, last_name?: string }, order: { id: number }) => {
    try {
        await mailService.sendMail({
            to: user.email,
            subject: `Respuesta solicitud de devolución pedido #${order.id}`,
            template: 'return-completed',
            context: { order, user },
        });
        console.log(`✅ Email de devolución completada enviado a ${user.email}`);
    } catch (error) {
        console.error('❌ Error enviando email de devolución completada:', error);
    }
};