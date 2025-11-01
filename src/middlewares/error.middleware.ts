import { Request, Response, NextFunction } from 'express';

/**
 * @middleware errorMiddleware
 * @summary Middleware global de manejo de errores.
 * @description
 * Este middleware captura cualquier excepción no controlada que ocurra en el ciclo de vida
 * de Express (controladores, servicios o middlewares) y devuelve una respuesta JSON consistente.
 * 
 * - Registra los errores en la consola del servidor.
 * - Devuelve una estructura estándar con `success: false` y un mensaje de error.
 * - En entornos de desarrollo (`NODE_ENV !== 'production'`), también expone el stack trace y
 *   detalles adicionales (como errores SQL).
 *
 * @param {Error} err - Objeto de error capturado.
 * @param {Request} req - Objeto de solicitud de Express.
 * @param {Response} res - Objeto de respuesta de Express.
 * @param {NextFunction} next - Función para continuar el flujo de middleware (no se suele usar aquí).
 * 
 * @returns {Response} Respuesta HTTP con un objeto JSON de error.
 *
 * @example
 * // app.ts
 * import express from 'express';
 * import { errorMiddleware } from './middlewares/error.middleware';
 *
 * const app = express();
 *
 * // ... tus rutas y controladores ...
 *
 * // Middleware global de errores al final de la cadena
 * app.use(errorMiddleware);
 */
export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    console.error('❌ Error capturado por middleware:', err);

    // Determinar el código de estado HTTP
    const statusCode = err.status || err.statusCode || 500;
    const message =
        err.message ||
        'Ha ocurrido un error interno en el servidor. Por favor, inténtalo más tarde.';

    // Verificar entorno (para mostrar detalles adicionales en desarrollo)
    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse: any = {
        success: false,
        message,
    };

    if (isDev) {
        errorResponse.stack = err.stack;
        if (err.sqlMessage) errorResponse.sql = err.sqlMessage;
    }

    res.status(statusCode).json(errorResponse);
}
