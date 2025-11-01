import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

const UPLOADS_FOLDER = path.join(process.cwd(), 'src/modules/products/uploads');

/**
 * Configuración de Multer para subida de imágenes de productos.
 * Las imágenes se guardan en `src/modules/products/uploads`.
 * Usa nombre seguro basado en timestamp y un número aleatorio.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1e9);
        const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '');
        cb(null, `${timestamp}-${random}-${safeName}`);
    }
});

/**
 * Filtro de archivos permitidos.
 * Solo se aceptan imágenes (mimetype que empiece por `image/`).
 * @param {Request} req - Objeto de petición de Express.
 * @param {Express.Multer.File} file - Archivo subido.
 * @param {multer.FileFilterCallback} cb - Callback para aceptar o rechazar archivo.
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'));
    }
};

/** Instancia configurada de multer (máx 5MB por archivo) */
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Normaliza los campos del cuerpo (`req.body`) de la petición.
 * Convierte `categories`, `price` y `stock` a sus tipos correctos.
 * @param {Request} req - Objeto de petición de Express.
 */
function normalizeBody(req: Request) {
    if (req.body && typeof req.body.categories === 'string') {
        const cats = (req.body.categories as string).split(',').map(s => s.trim()).filter(Boolean);
        req.body.categories = cats;
    }
    if (req.body && typeof req.body.price === 'string') {
        const n = parseFloat(req.body.price as string);
        req.body.price = Number.isNaN(n) ? req.body.price : n;
    }
    if (req.body && typeof req.body.stock === 'string') {
        const n = parseInt(req.body.stock as string, 10);
        req.body.stock = Number.isNaN(n) ? req.body.stock : n;
    }
}

/**
 * Crea un nuevo producto con imagen (multipart/form-data).
 * Implementa rollback: si falla la inserción en la base de datos,
 * la imagen subida se elimina automáticamente.
 *
 * @route POST /products
 * @access Private (Admin)
 * @body {string} name - Nombre del producto.
 * @body {string} [description] - Descripción del producto.
 * @body {number} [price] - Precio.
 * @body {number} [stock] - Cantidad disponible.
 * @body {string[]} [categories] - Categorías asociadas.
 * @body {File} image - Imagen del producto.
 * @returns {Promise<Response>} Devuelve un objeto con `{ message, id }`.
 */
export const uploadAndCreateProduct = [
    upload.single('image'),
    async (req: Request, res: Response) => {
        try {
            normalizeBody(req);

            if (!req.file) return res.status(400).json({ message: 'No se subió ninguna imagen' });

            req.body.image_url = req.file.filename;

            const result = await ProductsService.createProduct(req.body);
            return res.status(201).json(result);
        } catch (error: any) {
            console.error('uploadAndCreateProduct error:', error);

            // Rollback: eliminar imagen subida
            if (req.file && req.file.filename) {
                const filePath = path.join(UPLOADS_FOLDER, req.file.filename);
                try {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (err) {
                    console.warn('⚠️ Error borrando imagen tras fallo en creación:', err);
                }
            }
            return res.status(400).json({ message: error.message || 'Error al crear producto' });
        }
    }
];

/**
 * Middleware opcional para aceptar multipart/form-data.
 * Permite que un mismo endpoint acepte `application/json` o `multipart/form-data`.
 *
 * @param {Request} req - Objeto de petición.
 * @param {Response} res - Objeto de respuesta.
 * @param {NextFunction} next - Siguiente middleware.
 */
const optionalUpload = (req: Request, res: Response, next: NextFunction) => {
    const contentType = (req.headers['content-type'] || '').toString();
    if (contentType.includes('multipart/form-data')) {
        return upload.single('image')(req as any, res as any, next as any);
    }
    return next();
};

/**
 * Actualiza un producto existente.
 * Acepta JSON o multipart/form-data.
 * Si se sube una nueva imagen, se elimina la anterior.
 *
 * @route PUT /products/:id
 * @access Private (Admin)
 * @param {number} id.path.required - ID del producto a actualizar.
 * @body {string} [name] - Nombre.
 * @body {string} [description] - Descripción.
 * @body {number} [price] - Precio.
 * @body {number} [stock] - Stock.
 * @body {string[]} [categories] - Categorías.
 * @body {File} [image] - Nueva imagen del producto.
 * @returns {Promise<Response>} Producto actualizado.
 */
export const updateProduct = [
    optionalUpload,
    async (req: Request, res: Response) => {
        try {
            normalizeBody(req);
            if (req.file) req.body.image_url = (req.file as Express.Multer.File).filename;

            const updated = await ProductsService.updateProduct(parseInt(req.params.id!, 10), req.body);
            return res.json(updated);
        } catch (error: any) {
            console.error('updateProduct (combined) error:', error);

            if (req.file && req.file.filename) {
                const filePath = path.join(UPLOADS_FOLDER, req.file.filename);
                try {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (err) {
                    console.warn('⚠️ Error borrando imagen tras fallo en actualización:', err);
                }
            }
            return res.status(400).json({ message: error.message || 'Error al actualizar producto' });
        }
    }
];

/**
 * Obtiene la lista de productos (con filtros opcionales).
 *
 * @route GET /products
 * @access Public
 * @query {string} [categories] - IDs de categorías separados por coma.
 * @query {number} [limit] - Límite de resultados.
 * @query {number} [offset] - Desplazamiento para paginación.
 * @returns {Promise<Response>} Lista de productos.
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { categories, limit, offset } = req.query;
        const options: any = {};
        if (categories) {
            options.categoryIds = (categories as string).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        }
        if (limit) options.limit = parseInt(limit as string, 10);
        if (offset) options.offset = parseInt(offset as string, 10);

        const products = await ProductsService.getAllProducts(options);
        return res.json(products);
    } catch (error: any) {
        console.error('getAllProducts error:', error);
        return res.status(400).json({ message: error.message || 'Error al obtener productos' });
    }
};

/**
 * Obtiene un producto específico por su ID.
 *
 * @route GET /products/:id
 * @access Public
 * @param {number} id.path.required - ID del producto.
 * @returns {Promise<Response>} Producto encontrado.
 */
export const getProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductsService.getProduct(parseInt(req.params.id!, 10));
        return res.json(product);
    } catch (error: any) {
        console.error('getProduct error:', error);
        return res.status(400).json({ message: error.message || 'Error al obtener producto' });
    }
};

/**
 * Elimina un producto por su ID.
 * También elimina la imagen asociada si existe.
 *
 * @route DELETE /products/:id
 * @access Private (Admin)
 * @param {number} id.path.required - ID del producto a eliminar.
 * @returns {Promise<Response>} Confirmación de eliminación.
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const result = await ProductsService.deleteProduct(parseInt(req.params.id!, 10));
        return res.json(result);
    } catch (error: any) {
        console.error('deleteProduct error:', error);
        return res.status(400).json({ message: error.message || 'Error al eliminar producto' });
    }
};
