import { Router } from 'express';
import express from 'express';
import { PaymentsController } from './payments.controller';

const router = Router();

/**
 * @route POST /payments/checkout-session
 * @desc Crear una sesión de Stripe Checkout para un pedido específico.
 * - Recibe `orderId` y `frontendUrl` en el body.
 * - Retorna la URL de la sesión para redirigir al usuario al pago.
 *
 * @body {number} orderId - ID del pedido a pagar.
 * @body {string} frontendUrl - URL del frontend para redirección después del pago.
 * @returns {Promise<{url: string}>} - URL de la sesión de pago.
 *
 * @example
 * POST /payments/checkout-session
 * body: { orderId: 123, frontendUrl: "https://mi-frontend.com" }
 * response: { url: "https://checkout.stripe.com/..." }
 */
router.post('/checkout-session', PaymentsController.createCheckout);

/**
 * @route POST /payments/webhook
 * @desc Endpoint para recibir eventos de Stripe Webhook.
 * - Stripe enviará eventos como `checkout.session.completed`.
 * - Requiere body crudo para validar la firma (`stripe-signature`).
 *
 * @header {string} stripe-signature - Firma enviada por Stripe para validar el webhook.
 * @note Se debe usar `express.raw({ type: 'application/json' })` en el middleware para que funcione correctamente.
 *
 * @example
 * POST /payments/webhook
 * headers: { 'stripe-signature': '<firma-stripe>' }
 * body: { ...evento de Stripe... }
 */
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentsController.webhookHandler);

export default router;
