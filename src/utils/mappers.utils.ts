/**
 * @constant ORDER_STATUS_LABELS
 * @description
 * Etiquetas legibles en español para los distintos estados que puede tener un pedido.
 *
 * @example
 * ```ts
 * ORDER_STATUS_LABELS['pending']; // "Pendiente"
 * ```
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'En proceso',
    shipped: 'Enviado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    awaiting_return: 'Esperando retorno',
    returned: 'Devuelto'
};

/**
 * @function mapOrderStatus
 * @summary Mapea un código de estado de pedido a una etiqueta legible.
 * @description
 * Devuelve una representación en texto para un código interno de estado de pedido.
 * Si el código no existe o no se proporciona, devuelve un guion (`-`).
 *
 * @param {string | null} [code] - Código del estado (por ejemplo `'pending'`, `'completed'`).
 * @returns {string} Etiqueta legible correspondiente o `'-'` si no se encuentra el código.
 *
 * @example
 * ```ts
 * mapOrderStatus('shipped'); // "Enviado"
 * mapOrderStatus(null);      // "-"
 * ```
 */
export function mapOrderStatus(code?: string | null): string {
    if (!code) return '-';
    return ORDER_STATUS_LABELS[code] ?? code;
}

/**
 * @constant PAYMENT_STATUS_LABELS
 * @description
 * Etiquetas legibles en español para los diferentes estados de pago.
 *
 * @example
 * ```ts
 * PAYMENT_STATUS_LABELS['refunded']; // "Reembolsado"
 * ```
 */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
};

/**
 * @function mapPaymentStatus
 * @summary Traduce un código de estado de pago a una etiqueta legible.
 * @description
 * Devuelve una descripción de estado legible para mostrar en interfaces o reportes.
 * Si el código no existe o no se proporciona, devuelve `'-'`.
 *
 * @param {string | null} [code] - Código del estado de pago (por ejemplo `'pending'`, `'completed'`).
 * @returns {string} Etiqueta legible o `'-'` si el código no existe.
 *
 * @example
 * ```ts
 * mapPaymentStatus('failed'); // "Fallido"
 * mapPaymentStatus(undefined); // "-"
 * ```
 */
export function mapPaymentStatus(code?: string | null): string {
    if (!code) return '-';
    return PAYMENT_STATUS_LABELS[code] ?? code;
}

/**
 * @constant PAYMENT_METHOD_LABELS
 * @description
 * Etiquetas legibles en español para los métodos de pago soportados por el sistema.
 *
 * @example
 * ```ts
 * PAYMENT_METHOD_LABELS['paypal']; // "PayPal"
 * ```
 */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    card: 'Tarjeta',
    paypal: 'PayPal',
    sepa_debit: 'Transferencia SEPA',
    klarna: 'Klarna',
    bancontact: 'Bancontact',
    ideal: 'iDEAL',
    alipay: 'Alipay',
    afterpay_clearpay: 'Afterpay / Clearpay',
    bizum: 'Bizum',
};

/**
 * @function mapPaymentMethod
 * @summary Convierte un código de método de pago en una etiqueta legible.
 * @description
 * Devuelve una descripción entendible para el usuario final.  
 * Si el código no se reconoce, devuelve `'Método no identificado'`.
 *
 * @param {string | null} [code] - Código del método de pago (por ejemplo `'card'`, `'paypal'`).
 * @returns {string} Etiqueta legible o `'Método no identificado'` si el código no existe.
 *
 * @example
 * ```ts
 * mapPaymentMethod('bizum'); // "Bizum"
 * mapPaymentMethod('unknown'); // "Método no identificado"
 * ```
 */
export function mapPaymentMethod(code?: string | null): string {
    if (!code) return 'Método no identificado';
    return PAYMENT_METHOD_LABELS[code] ?? 'Método no identificado';
}
