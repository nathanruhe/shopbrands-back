import Stripe from 'stripe';

/**
 * Clave secreta de Stripe obtenida de las variables de entorno.
 * Esta clave permite realizar operaciones sensibles como crear pagos y reembolsos.
 * 
 * @throws {Error} Si `STRIPE_SECRET_KEY` no está definida en el archivo `.env`
 */
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error('⚠️ STRIPE_SECRET_KEY no está definida en .env');
}

/**
 * Instancia de Stripe configurada para interactuar con la API de Stripe.
 * Se debe usar esta instancia para todas las operaciones de pagos.
 *
 * @example
 * ```ts
 * import { stripe } from './stripe.service';
 * 
 * // Crear un cliente
 * const customer = await stripe.customers.create({ email: 'cliente@correo.com' });
 * 
 * // Crear un pago
 * const paymentIntent = await stripe.paymentIntents.create({
 *   amount: 1000,
 *   currency: 'usd',
 *   customer: customer.id,
 * });
 * ```
 */
export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20' as any,
});
