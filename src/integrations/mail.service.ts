import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

interface EmailAttachment {
    filename: string;
    path: string;
}

interface EmailOptions {
    to: string;
    subject: string;
    template?: string;
    context?: Record<string, any>;
    attachments?: EmailAttachment[];
    html?: string;
}

class MailService {
    private transporter: nodemailer.Transporter;

    /**
     * Inicializa el transportador de nodemailer con la configuración SMTP
     */
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    /**
     * Renderiza una plantilla EJS con las variables proporcionadas.
     * Añade automáticamente `BASE_URL` al contexto.
     *
     * @param templateName Nombre de la plantilla EJS (sin extensión)
     * @param context Variables que estarán disponibles en la plantilla
     * @returns HTML renderizado como string
     * @throws Error si la plantilla no existe
     */
    private async renderTemplate(templateName: string, context: Record<string, any> = {}) {
        const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Plantilla no encontrada: ${templatePath}`);
        }
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        // Añadimos BASE_URL automáticamente al contexto
        const finalContext = {
            ...context,
            BASE_URL: process.env.BASE_URL || '',
        };
        return ejs.render(templateContent, finalContext);
    }

    /**
     * Envía un correo electrónico usando SMTP.
     *
     * Prioridad:
     * 1. Si `html` está definido, se envía directamente.
     * 2. Si `template` está definido, se renderiza con el contexto proporcionado.
     *
     * @param options Opciones de envío
     * @param options.to Destinatario del correo
     * @param options.subject Asunto del correo
     * @param options.template Nombre de la plantilla EJS (opcional)
     * @param options.context Variables para la plantilla (opcional)
     * @param options.attachments Archivos adjuntos (opcional)
     * @param options.html HTML directo para el correo (opcional)
     * @returns Información del correo enviado (`nodemailer.SentMessageInfo`)
     * @throws Error si no se proporciona HTML ni plantilla, o si falla el envío
     *
     * @example
     * ```ts
     * await mailService.sendMail({
     *   to: 'cliente@correo.com',
     *   subject: 'Confirmación de pedido',
     *   template: 'order-confirmation',
     *   context: { orderId: 123 }
     * });
     * ```
     */
    public async sendMail(options: EmailOptions) {
        let htmlContent = options.html;

        if (!htmlContent && options.template) {
            htmlContent = await this.renderTemplate(options.template, options.context);
        }

        if (!htmlContent) {
            throw new Error('No se proporcionó HTML ni plantilla para el correo');
        }

        const mailOptions = {
            from: `"ShopBrands" <${process.env.SMTP_FROM}>`,
            to: options.to,
            subject: options.subject,
            html: htmlContent,
            attachments: options.attachments || [],
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Correo enviado: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Error enviando correo:', error);
            throw error;
        }
    }
}

/** Instancia singleton del servicio de correo */
export const mailService = new MailService();
