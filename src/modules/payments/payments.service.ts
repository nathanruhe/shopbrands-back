import { stripe } from '../../integrations/stripe.service';
import { db } from '../../config/config';
import { RowDataPacket } from 'mysql2';
import { GET_ORDER_BY_ID, UPDATE_ORDER_STATUS, INSERT_PAYMENT_RECORD, UPDATE_ORDER_TOTALS } from '../../database/queries/payments.queries';
import { sendOrderConfirmationEmail } from '../orders/notifications/send-order-confirmation';
import { InvoiceService, OrderData } from '../orders/invoice/invoice.service';
import Stripe from 'stripe';
import { notifyAdminPaymentReceived } from '../../utils/notifications.util';
import { CartService } from '../cart/cart.service';

interface CheckoutItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

/**
 * Servicio para pagos y manejo de sesiones Stripe
 */
export const PaymentsService = {
    /**
     * Crea una sesión de Stripe Checkout para un pedido específico.
     * - Permite pagos con tarjeta.
     * - Configura URLs de éxito y cancelación para redirección.
     * - Añade metadata con `orderId` para referencia futura.
     *
     * @param {number} orderId - ID del pedido que se va a pagar.
     * @param {string} frontendUrl - URL base del frontend para redirección después del pago.
     * @returns {Promise<Stripe.Checkout.Session>} - Sesión de Stripe creada.
     * @throws {Error} Si el pedido no existe en la base de datos.
     *
     * @example
     * ```ts
     * const session = await PaymentsService.createCheckoutSession(123, 'https://mi-frontend.com');
     * console.log(session.url);
     * ```
     */
    async createCheckoutSession(orderId: number, frontendUrl: string) {
        const [rows] = await db.query<RowDataPacket[]>(GET_ORDER_BY_ID, [orderId]);
        const order = rows[0] as RowDataPacket;
        if (!order) throw new Error('Pedido no encontrado');

        const items: CheckoutItem[] = [
            { id: 1, name: `Pedido #${order.id}`, price: Number(order.total), quantity: 1 }
        ];

        // Crear sesión de checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/cancel`,
            allow_promotion_codes: true,
            metadata: {
                orderId: order.id,
            },
        });

        return session;
    },

    /**
     * Procesa eventos recibidos desde Stripe Webhook.
     * - Maneja el evento `checkout.session.completed`.
     * - Actualiza el estado del pedido, inserta registro de pago y actualiza totales.
     * - Elimina carrito del usuario tras pago exitoso.
     * - Genera factura PDF y envía correo de confirmación.
     * - Notifica al administrador de pago recibido.
     *
     * @param {Stripe.Event} event - Evento recibido desde Stripe Webhook.
     * @returns {Promise<void>} - No retorna valor.
     * @throws {Error} - Si ocurre un error procesando el webhook o los datos del pedido.
     *
     * @example
     * ```ts
     * // Express webhook handler
     * app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
     *   const sig = req.headers['stripe-signature'];
     *   const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
     *   await PaymentsService.handleWebhook(event);
     *   res.json({ received: true });
     * });
     * ```
     */
    async handleWebhook(event: Stripe.Event) {
        try {
            if (event.type === 'checkout.session.completed') {
                const sessionFromEvent = event.data.object as Stripe.Checkout.Session;
                const orderIdStr = sessionFromEvent.metadata?.orderId;
                if (!orderIdStr) throw new Error('OrderId no encontrado en metadata');
                const orderId = parseInt(orderIdStr, 10);

                // Recuperar sesión completa desde Stripe (opcional)
                let session: Stripe.Checkout.Session = sessionFromEvent;
                try {
                    if (sessionFromEvent.id) {
                        session = await stripe.checkout.sessions.retrieve(sessionFromEvent.id as string);
                    }
                } catch (err) {
                    console.warn('⚠️ No se pudo hacer retrieve de la session, usamos la del evento:', err);
                }

                // Calcular total pagado (de centimos a euros)
                const totalPaidCents = session.amount_total ?? 0;
                const totalPaid = Number((totalPaidCents / 100).toFixed(2));

                // Calcular descuento aplicado (si existe)
                let discountAmount = 0;
                try {
                    const totalDetails: any = session as any;
                    if (totalDetails.total_details?.amount_discount) {
                        discountAmount = Number((totalDetails.total_details.amount_discount / 100).toFixed(2));
                    } else {
                        const discounts = totalDetails.total_details?.breakdown?.discounts || totalDetails.discounts || [];
                        if (discounts.length > 0) {
                            const first = discounts[0];
                            if (first?.amount_off) discountAmount = Number((first.amount_off / 100).toFixed(2));
                            else if (first?.coupon?.amount_off) discountAmount = Number((first.coupon.amount_off / 100).toFixed(2));
                            else if (first?.discount?.coupon?.amount_off) discountAmount = Number((first.discount.coupon.amount_off / 100).toFixed(2));
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ No se pudo calcular discountAmount desde session:', e);
                }

                // Obtener código de promoción legible
                let promotionCode: string | null = null;
                try {
                    const discounts = (session as any)?.discounts || [];
                    if (discounts.length > 0) {
                        const first = discounts[0];
                        const promotionId = first?.promotion_code || null;

                        if (promotionId) {
                            const promoObj = await stripe.promotionCodes.retrieve(promotionId);
                            promotionCode = promoObj.code;
                        }
                    }

                    // fallback: si lo guardaste en metadata
                    if (!promotionCode && session.metadata?.promotion_code) {
                        promotionCode = session.metadata.promotion_code;
                    }
                } catch (e) {
                    console.warn('⚠️ No se pudo extraer promotion code legible:', e);
                }

                console.log('✅ Stripe webhook datos:', {
                    orderId,
                    totalPaid,
                    discountAmount,
                    promotionCode,
                    sessionId: session.id,
                });

                // Actualizar estado del pedido en la base de datos
                await db.query(UPDATE_ORDER_STATUS, ['completed', orderId]);

                // Insertar registro de pago en la base de datos
                await db.query(INSERT_PAYMENT_RECORD, [
                    orderId,
                    session.payment_intent ?? null,
                    totalPaid,
                    'completed',
                    'card',
                    discountAmount,
                    promotionCode,
                ]);

                // Actualizar totales en la tabla orders
                await db.query(UPDATE_ORDER_TOTALS, [
                    totalPaid,
                    discountAmount,
                    promotionCode,
                    orderId,
                ]);

                // Eliminar carrito del usuario tras pago exitoso
                const [userRows] = await db.query<RowDataPacket[]>(
                    'SELECT user_id FROM orders WHERE id = ?',
                    [orderId]
                );
                const userId = userRows[0]?.user_id;

                if (userId) {
                    try {
                        await CartService.deleteCart(userId);
                        console.log(`🗑️ Carrito del usuario ${userId} eliminado tras pago completado`);
                    } catch (err) {
                        console.warn(`⚠️ No se pudo eliminar el carrito del usuario ${userId}:`, err);
                    }
                }

                // Obtener información completa del pedido actualizada y generar factura + enviar email
                const orderData: OrderData = await InvoiceService.getOrderData(orderId);
                (orderData as any).payment_meta = {
                    stripe_session_id: session.id,
                    stripe_payment_intent: session.payment_intent,
                    total_paid: totalPaid,
                    discount_amount: discountAmount,
                    promotion_code: promotionCode,
                };

                // 🔔 Notificación en tiempo real al admin
                notifyAdminPaymentReceived(orderId);

                // Enviar correo de confirmación y factura
                await sendOrderConfirmationEmail(orderData);

            } else {
                console.log(`Evento Stripe ignorado: ${event.type}`);
            }
        } catch (err: any) {
            console.error('Error procesando webhook stripe (PaymentsService):', err);
            throw err;
        }
    },
};
