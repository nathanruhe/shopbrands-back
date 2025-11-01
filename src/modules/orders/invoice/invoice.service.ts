import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { db } from '../../../config/config';
import { RowDataPacket } from 'mysql2';
import { GET_ORDER_WITH_ADDRESS, GET_ORDER_ITEMS_WITH_PRODUCT, GET_PAYMENTS_BY_ORDER } from '../../../database/queries/invoice.queries';
import { mapOrderStatus, mapPaymentMethod, mapPaymentStatus } from '../../../utils/mappers.utils';

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
    size?: string;
    color?: string;
    sku?: string;
    product_name?: string;
}

export interface OrderData {
    id: number;
    user: { first_name: string; last_name: string; email: string; name: string };
    items: OrderItem[];
    total: number;
    total_paid: number | null;
    discount_amount: number | null;
    promotion_code: string | null;
    created_at: string;
    address: {
        full_name: string;
        street: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
        phone: string;
    };
    status?: string;
    status_label?: string;
    payments?: Array<any>;
    payment_meta?: any;
}

/**
 * Servicio para manejar generación de facturas (HTML y PDF) de pedidos.
 */
export const InvoiceService = {

    /**
     * Obtiene la información completa de un pedido por ID, incluyendo items y pagos.
     * Reconstruye el total original si fuera necesario.
     * @param {number} orderId - ID del pedido
     * @returns {Promise<OrderData>} - Datos completos del pedido
     * @throws Error si el pedido no existe
     */
    getOrderData: async (orderId: number): Promise<OrderData> => {
        const [orderRows] = await db.query<RowDataPacket[]>(GET_ORDER_WITH_ADDRESS, [orderId]);
        const order = orderRows[0];
        if (!order) throw new Error('Pedido no encontrado');

        const [itemsRows] = await db.query<RowDataPacket[]>(GET_ORDER_ITEMS_WITH_PRODUCT, [orderId]);
        const items: OrderItem[] = itemsRows.map((item) => ({
            name: item.name || item.product_name,
            quantity: item.quantity,
            price: Number(item.price),
            image_url: item.image_url,
            size: item.size,
            color: item.color,
            sku: item.sku,
            product_name: item.name || item.product_name,
        }));

        const [paymentsRows] = await db.query<RowDataPacket[]>(GET_PAYMENTS_BY_ORDER, [orderId]);
        const payments = (paymentsRows || []).map((p: any) => ({
            ...p,
            method_label: mapPaymentMethod(p.method),
            status_label: mapPaymentStatus(p.status),
        }));

        const dbTotal = Number(order.total);
        const dbTotalPaid = order.total_paid !== null && typeof order.total_paid !== 'undefined' ? Number(order.total_paid) : null;
        const dbDiscount = order.discount_amount !== null && typeof order.discount_amount !== 'undefined' ? Number(order.discount_amount) : null;

        let originalTotal = dbTotal;
        if (dbTotalPaid !== null && dbDiscount !== null && Math.abs(dbTotal - dbTotalPaid) < 0.0001) {
            originalTotal = Number((dbTotalPaid + dbDiscount).toFixed(2));
        }

        return {
            id: order.id,
            user: {
                first_name: order.first_name,
                last_name: order.last_name,
                email: order.email,
                name: `${order.first_name} ${order.last_name}`,
            },
            items,
            total: Number(originalTotal),
            total_paid: dbTotalPaid,
            discount_amount: dbDiscount,
            promotion_code: order.promotion_code ?? null,
            created_at: order.created_at,
            address: {
                full_name: order.full_name || `${order.first_name} ${order.last_name}`,
                street: order.street,
                city: order.city,
                province: order.province,
                postal_code: order.postal_code,
                country: order.country,
                phone: order.phone,
            },
            status: order.status,
            status_label: mapOrderStatus(order.status),
            payments,
        };
    },

    /**
     * Genera el HTML de la factura a partir de los datos del pedido usando EJS.
     * @param {OrderData} order - Datos completos del pedido
     * @returns {Promise<string>} - HTML renderizado de la factura
    */
    generateInvoiceHTML: async (order: OrderData): Promise<string> => {
        const templatePath = path.join(__dirname, 'templates', 'index.html');
        const template = fs.readFileSync(templatePath, 'utf-8');
        const BASE_URL = process.env.BASE_URL || '';
        return ejs.render(template, { order, BASE_URL });
    },

    /**
     * Genera un PDF de la factura a partir de los datos del pedido.
     * Utiliza Puppeteer para renderizar el HTML a PDF.
     * @param {OrderData} order - Datos completos del pedido
     * @returns {Promise<Buffer>} - Buffer del PDF generado
    */
    generatePDFBuffer: async (order: OrderData): Promise<Buffer> => {
        const htmlContent = await InvoiceService.generateInvoiceHTML(order);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        await page.evaluateHandle('document.fonts.ready');

        const bodyHeight = await page.evaluate(() => {
            // @ts-ignore (directiva para ignorar cualquier error de tipo)
            const body = document.body;
            // @ts-ignore
            const html = document.documentElement;
            return Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
        });

        const pdfBuffer = await page.pdf({
            width: '210mm',
            height: `${bodyHeight}px`,
            printBackground: true,
            margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
        });

        await browser.close();
        return Buffer.from(pdfBuffer);
    },
};
