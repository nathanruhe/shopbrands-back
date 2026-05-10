import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';

/**
 * Obtener todas las categorías.
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {Promise<void>} Respuesta JSON con la lista de categorías
 * @example
 * GET /categories
 */
export const getAllCategories = async (
    req: Request,
    res: Response
    ): Promise<void> => {
    try {
        const categories = await CategoriesService.getAllCategories();

        res.json(categories);
    } catch (error: any) {
        console.error('getAllCategories error:', error);

        res.status(500).json({
        message: error.message || 'Error interno del servidor'
        });
    }
    };

/**
 * Obtener una categoría por su ID.
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {Promise<void>} Respuesta JSON con la categoría encontrada
 * @example
 * GET /categories/1
 */
export const getCategoryById = async (
    req: Request,
    res: Response
    ): Promise<void> => {
    try {
        const category = await CategoriesService.getCategoryById(
        Number(req.params.id)
        );

        res.json(category);
    } catch (error: any) {
        console.error('getCategoryById error:', error);

        res.status(400).json({
        message: error.message
        });
    }
};

/**
 * Crear una nueva categoría.
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {Promise<void>} Respuesta JSON con la categoría creada
 * @example
 * POST /categories
 */
export const createCategory = async (
    req: Request,
    res: Response
    ): Promise<void> => {
    try {
        const category = await CategoriesService.createCategory(req.body);

        res.status(201).json(category);
    } catch (error: any) {
        console.error('createCategory error:', error);

        res.status(400).json({
        message: error.message
        });
    }
};

/**
 * Actualizar una categoría por su ID.
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {Promise<void>} Respuesta JSON con la categoría actualizada
 * @example
 * PUT /categories/1
 */
export const updateCategoryById = async (
    req: Request,
    res: Response
    ): Promise<void> => {
    try {
        const category = await CategoriesService.updateCategoryById(
        Number(req.params.id),
        req.body
        );

        res.json(category);
    } catch (error: any) {
        console.error('updateCategoryById error:', error);

        res.status(400).json({
        message: error.message
        });
    }
};

/**
 * Eliminar una categoría por su ID.
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {Promise<void>} Respuesta JSON con mensaje de confirmación
 * @example
 * DELETE /categories/1
 */
export const deleteCategoryById = async (
    req: Request,
    res: Response
    ): Promise<void> => {
    try {
        const result = await CategoriesService.deleteCategoryById(
        Number(req.params.id)
        );

        res.json(result);
    } catch (error: any) {
        console.error('deleteCategoryById error:', error);

        res.status(400).json({
        message: error.message
        });
    }
};