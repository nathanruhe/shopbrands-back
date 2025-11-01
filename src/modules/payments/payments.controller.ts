import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { stripe } from '../../integrations/stripe.service';
import Stripe from 'stripe';

export const PaymentsController = {
    /**
     * Crear sesión de Stripe Checkout para un pedido específico.
     * - Recibe `orderId` y `frontendUrl` en el body.
     * - Retorna la URL de la sesión para redirigir al usuario al pago.
     *
     * @param {Request} req - Objeto de request de Express.
     * @param {Request['body']} req.body - Datos del pedido.
     * @param {number} req.body.orderId - ID del pedido a pagar.
     * @param {string} req.body.frontendUrl - URL del frontend para redirección después del pago.
     * @param {Response} res - Objeto de response de Express.
     * @returns {Promise<void>} - Retorna JSON con `{ url: string }` para redirigir al usuario.
     *
     * @example
     * ```ts
     * POST /payments/checkout
     * body: { orderId: 123, frontendUrl: "https://mi-frontend.com" }
     * response: { url: "https://checkout.stripe.com/..." }
     * ```
     */
    async createCheckout(req: Request, res: Response) {
        try {
            const { orderId, frontendUrl } = req.body;
            if (!orderId || !frontendUrl) {
                return res.status(400).json({ message: 'orderId y frontendUrl son requeridos' });
            }

            const session = await PaymentsService.createCheckoutSession(orderId, frontendUrl);
            res.json({ url: session.url });
        } catch (err) {
            console.error('Error creando Checkout Session:', err);
            res.status(500).json({ message: (err as Error).message });
        }
    },

    /**
     * Handler para recibir eventos de Stripe Webhook.
     * - Valida la firma usando `stripe-signature` del header.
     * - Procesa eventos relacionados con pagos, como `checkout.session.completed`.
     * - Actualiza base de datos, genera factura y envía notificaciones.
     *
     * @param {Request} req - Objeto de request de Express.
     * @param {Request['headers']} req.headers - Headers de la solicitud, incluyendo `stripe-signature`.
     * @param {string} req.headers['stripe-signature'] - Firma enviada por Stripe para validar el webhook.
     * @param {Request['rawBody']} req.rawBody - Cuerpo crudo necesario para validar la firma de Stripe.
     * @param {Response} res - Objeto de response de Express.
     * @returns {Promise<void>} - Responde con `{ received: true }` si se procesó correctamente, o con error HTTP 400/500.
     *
     * @example
     * ```ts
     * // Endpoint Express
     * app.post('/payments/webhook', express.raw({ type: 'application/json' }), PaymentsController.webhookHandler);
     * ```
     */
    async webhookHandler(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        if (!sig) return res.status(400).send('Falta stripe-signature');

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                (req as any).rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error('Error webhook:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            await PaymentsService.handleWebhook(event);
            res.json({ received: true });
        } catch (err) {
            console.error('Error procesando webhook:', err);
            res.status(500).send('Error interno');
        }
    },
};

