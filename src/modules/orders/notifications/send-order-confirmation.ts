import { mailService } from '../../../integrations/mail.service';
import { InvoiceService, OrderData } from '../invoice/invoice.service';
import fs from 'fs';
import path from 'path';

/**
 * Envía un correo de confirmación de pedido al usuario con la factura adjunta en PDF.
 * 
 * Flujo:
 * 1. Genera el PDF de la factura usando `InvoiceService.generatePDFBuffer`.
 * 2. Crea un archivo temporal con el PDF.
 * 3. Envía un correo usando `mailService.sendMail` con la plantilla `order-confirmation`.
 * 4. Adjunta el PDF generado.
 * 5. Elimina el archivo temporal después de enviar el correo.
 *
 * @param {OrderData} order - Datos completos del pedido, incluyendo información del usuario y correo electrónico.
 * @param {number} order.id - ID del pedido.
 * @param {object} order.user - Información del usuario.
 * @param {string} order.user.email - Correo del usuario.
 * @param {string} order.user.first_name - Nombre del usuario.
 * @param {string} order.user.last_name - Apellido del usuario.
 * @param {number} order.total - Total del pedido.
 * @param {number | null} order.discount_amount - Descuento aplicado si existe.
 * @param {number | null} order.total_paid - Total pagado por el usuario.
 * @returns {Promise<void>} - No retorna valor, solo envía el correo de confirmación.
 * @throws {Error} - Lanza error si falla la generación del PDF o el envío del correo.
 *
 * @example
 * ```ts
 * import { sendOrderConfirmationEmail } from './notifications/send-order-confirmation';
 * import { OrdersService } from '../orders/orders.service';
 * 
 * const order = await OrdersService.getOrderWithItems(123, userId);
 * await sendOrderConfirmationEmail(order);
 * ```
 */
export const sendOrderConfirmationEmail = async (order: OrderData) => {
    const tempPath = path.join(__dirname, `Factura-Pedido-${order.id}.pdf`);
    try {
        // Generar el PDF (InvoiceService usa los valores actualizados desde DB)
        const pdfBuffer = await InvoiceService.generatePDFBuffer(order);
        fs.writeFileSync(tempPath, pdfBuffer);

        // Llamada al servicio de mail con plantilla e attachment
        await mailService.sendMail({
            to: order.user.email,
            subject: `Tu pedido #${order.id} ha sido confirmado`,
            template: 'order-confirmation',  // coincide con order-confirmation.ejs
            context: { order },              // la plantilla recibirá order.discount_amount y order.total_paid
            attachments: [{ filename: `Factura-Pedido-${order.id}.pdf`, path: tempPath }],
        });

        console.log(`✅ Email de confirmación enviado a ${order.user.email}`);
    } catch (err) {
        console.error('❌ Error enviando email:', err);
    } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
};
