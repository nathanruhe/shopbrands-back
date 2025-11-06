import { mailService } from '../../../integrations/mail.service';

/**
 * Envía un correo al usuario con el enlace para restablecer su contraseña.
 *
 * Flujo:
 * 1. Recibe el email del usuario y el enlace de recuperación generado por AuthService.
 * 2. Usa la plantilla `password-reset.ejs`.
 * 3. Envía el correo a través de `mailService`.
 *
 * @param {string} email - Dirección de correo del usuario.
 * @param {string} resetLink - Enlace único de restablecimiento (con token incluido).
 * @returns {Promise<void>} No retorna valor, solo envía el correo.
 * @throws {Error} Lanza error si el envío falla.
 *
 * @example
 * ```ts
 * await sendPasswordResetEmail('usuario@email.com', 'https://shopbrands.com/reset-password?token=abc123');
 * ```
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    try {
        await mailService.sendMail({
            to: email,
            subject: 'Recupera tu contraseña - ShopBrands',
            template: 'password-reset', // tu plantilla EJS
            context: { resetLink },
        });
        console.log(`✅ Email de recuperación enviado a ${email}`);
    } catch (err) {
        console.error('❌ Error enviando email de recuperación:', err);
        throw err;
    }
};
