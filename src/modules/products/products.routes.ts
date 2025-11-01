import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { 
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    uploadAndCreateProduct
} from './products.controller';

const router = Router();

/**
 * Obtener todos los productos disponibles.
 * Permite filtrar por categorías y aplicar paginación.
 *
 * @route GET /products
 * @access Public
 * @query {string} [categories] - IDs de categorías separados por coma.
 * @query {number} [limit] - Límite de resultados por página.
 * @query {number} [offset] - Offset de paginación.
 * @returns {Promise<Response>} Lista de productos disponibles.
 */
router.get('/', getAllProducts);

/**
 * Obtener un producto específico por su ID.
 *
 * @route GET /products/:id
 * @access Public
 * @param {number} id.path.required - ID del producto a obtener.
 * @returns {Promise<Response>} Objeto del producto solicitado.
 */
router.get('/:id', getProduct);

/**
 * Crear un nuevo producto con imagen asociada.
 * Requiere autenticación de administrador.
 * Acepta `multipart/form-data` (campo `image`).
 * Implementa rollback si la creación falla (elimina imagen subida).
 *
 * @route POST /products
 * @access Private (Admin)
 * @middleware authenticate, authorize('admin')
 * @body {string} name - Nombre del producto.
 * @body {string} [description] - Descripción del producto.
 * @body {number} price - Precio del producto.
 * @body {number} [stock] - Cantidad disponible.
 * @body {string[]} [categories] - Categorías asociadas.
 * @body {string} [size] - Talla (opcional).
 * @body {string} [color] - Color (opcional).
 * @body {string} [sku] - Código SKU (opcional).
 * @body {File} image - Imagen principal del producto.
 * @returns {Promise<Response>} Producto creado con su información.
 */
router.post('/', authenticate, authorize('admin'), ...uploadAndCreateProduct);

/**
 * Actualizar un producto existente.
 * Permite actualizar campos individuales o reemplazar la imagen.
 * Acepta tanto `application/json` como `multipart/form-data`.
 *
 * @route PUT /products/:id
 * @access Private (Admin)
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID del producto a actualizar.
 * @body {string} [name] - Nombre del producto.
 * @body {string} [description] - Descripción del producto.
 * @body {number} [price] - Precio del producto.
 * @body {number} [stock] - Cantidad en inventario.
 * @body {string[]} [categories] - Categorías asociadas.
 * @body {string} [size] - Talla (opcional).
 * @body {string} [color] - Color (opcional).
 * @body {string} [sku] - Código SKU (opcional).
 * @body {File} [image] - Nueva imagen del producto.
 * @returns {Promise<Response>} Producto actualizado correctamente.
 */
router.put('/:id', authenticate, authorize('admin'), ...updateProduct);

/**
 * Eliminar un producto por su ID.
 * También elimina su imagen asociada del sistema de archivos.
 *
 * @route DELETE /products/:id
 * @access Private (Admin)
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID del producto a eliminar.
 * @returns {Promise<Response>} Confirmación de eliminación exitosa.
 */
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
