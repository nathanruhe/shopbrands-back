import express from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategoryById,
    deleteCategoryById
} from './categories.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /categories
 * @summary Obtiene todas las categorías
 * @description Devuelve un listado completo de categorías disponibles en el sistema.
 * @access Public
 * @returns {Array<Object>} Lista de categorías
 *
 * @example
 * // GET /api/categories
 * res.json([
 *   {
 *     id: 1,
 *     name: "Tecnología",
 *     description: "Categorías relacionadas con tecnología"
 *   },
 *   {
 *     id: 2,
 *     name: "Deportes",
 *     description: "Categorías deportivas"
 *   }
 * ]);
 */
router.get('/', getAllCategories);

/**
 * @route GET /categories/:id
 * @summary Obtiene una categoría por su ID
 * @description Devuelve la información de una categoría específica según el ID proporcionado.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID de la categoría
 * @returns {Object} Datos de la categoría
 *
 * @example
 * // GET /api/categories/1
 * res.json({
 *   id: 1,
 *   name: "Tecnología",
 *   description: "Categorías relacionadas con tecnología"
 * });
 */
router.get('/:id', authenticate, authorize('admin'), getCategoryById);

/**
 * @route POST /categories
 * @summary Crea una nueva categoría
 * @description Permite a un administrador registrar una nueva categoría.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @body {string} name.required - Nombre de la categoría
 * @body {string} [description] - Descripción de la categoría
 * @returns {Object} Categoría creada
 *
 * @example
 * // POST /api/categories
 * req.body = {
 *   name: "Educación",
 *   description: "Contenido educativo"
 * };
 *
 * res.status(201).json({
 *   id: 3,
 *   name: "Educación",
 *   description: "Contenido educativo"
 * });
 */
router.post('/', authenticate, authorize('admin'), createCategory);

/**
 * @route PUT /categories/:id
 * @summary Actualiza una categoría existente
 * @description Permite a un administrador modificar los datos de una categoría.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID de la categoría a actualizar
 * @body {string} [name] - Nuevo nombre de la categoría
 * @body {string} [description] - Nueva descripción de la categoría
 * @returns {Object} Categoría actualizada
 *
 * @example
 * // PUT /api/categories/1
 * req.body = {
 *   name: "Tecnología Avanzada"
 * };
 *
 * res.json({
 *   id: 1,
 *   name: "Tecnología Avanzada",
 *   description: "Categorías relacionadas con tecnología"
 * });
 */
router.put('/:id', authenticate, authorize('admin'), updateCategoryById);

/**
 * @route DELETE /categories/:id
 * @summary Elimina una categoría por su ID
 * @description Elimina permanentemente una categoría específica del sistema.
 * @access Admin
 * @middleware authenticate, authorize('admin')
 * @param {number} id.path.required - ID de la categoría a eliminar
 * @returns {Object} Mensaje de confirmación
 *
 * @example
 * // DELETE /api/categories/1
 * res.json({
 *   message: "Categoría con ID 1 eliminada correctamente"
 * });
 */
router.delete('/:id', authenticate, authorize('admin'), deleteCategoryById);

export default router;