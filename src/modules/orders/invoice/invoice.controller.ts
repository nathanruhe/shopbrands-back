import { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware';

/**
 * @function generateInvoice
 * @summary Genera el PDF de la factura para un pedido específico
 * @param {AuthenticatedRequest} req - Request autenticado, con `req.user` disponible
 * @param {Response} res - Response de Express
 * @returns {Promise<void>} Envía el PDF de la factura o un error en formato JSON
 * @throws 400 - Error general en la generación de la factura
 * @throws 404 - Si el pedido no se encuentra
 * @security JWT
 * @example
 * GET /api/orders/invoice/123
*/
export const generateInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const orderId = parseInt(req.params.id!);

        // 1️⃣ Obtener los datos completos del pedido, incluyendo items y dirección
        const order = await InvoiceService.getOrderData(orderId);
        if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

        // 2️⃣ Generar PDF de la factura
        const pdfBuffer = await InvoiceService.generatePDFBuffer(order);

        // 3️⃣ Enviar PDF al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=factura_${order.id}.pdf`);
        res.send(pdfBuffer);
    } catch (error: any) {
        console.error('Error generando factura:', error);
        res.status(400).json({ message: error.message });
    }
};
