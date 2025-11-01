import { Router } from 'express';
import { generateInvoice } from './invoice.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/orders/invoice/:id
 * @group Invoice - Facturas de pedidos
 * @summary Genera y devuelve el PDF de la factura de un pedido específico
 * @param {string} id.path.required - ID del pedido
 * @returns {file} 200 - PDF de la factura
 * @returns {object} 400 - Error en caso de pedido no encontrado o usuario no autorizado
 * @security JWT
 */
router.get('/:id', authenticate, generateInvoice);

export default router;
