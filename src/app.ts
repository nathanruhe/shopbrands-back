import express, { Application, Request } from 'express';
import cors from 'cors';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { errorMiddleware } from './middlewares/error.middleware';

/** 
 * Instancia principal de Express
 */
const app: Application = express();

/** 
 * Configuración de CORS
 * Permite solicitudes desde cualquier origen y métodos comunes
 */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Middleware para parsear JSON
 * Guarda el rawBody para Stripe Webhooks (necesario para verificar firmas)
 */
app.use(
    express.json({
        verify: (req: unknown, res, buf) => {
            const request = req as Request;
            if (request.originalUrl.startsWith('/api/payments/webhook')) {
                (request as any).rawBody = buf;
            }
        },
    })
);

/**
 * Servir archivos estáticos
 * Carpeta de imágenes de productos
 * @example
 * GET /uploads/imagen.png
 */
const uploadsPath = path.resolve(__dirname, 'modules', 'products', 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log(`📦 Servidor de imágenes: /uploads -> ${uploadsPath}`);

/**
 * Configuración Swagger / OpenAPI
 * Permite acceder a la documentación de la API en /api-docs
 */
try {
    const swaggerFilePath = path.join(__dirname, '../docs/openapi.yaml');
    const swaggerDocument = fs.readFileSync(swaggerFilePath, 'utf8');
    const swaggerData = yaml.load(swaggerDocument) as Record<string, any>;
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerData));
    console.log('✅ Swagger cargado en /api-docs');
} catch (error) {
    console.warn('⚠️ No se pudo cargar Swagger Docs:', error);
}

/**
 * Rutas principales
 */
app.use('/api', routes);

/**
 * Middleware global de manejo de errores
 * Captura errores no manejados en la aplicación y devuelve una respuesta JSON consistente
 */
app.use(errorMiddleware);

export default app;
