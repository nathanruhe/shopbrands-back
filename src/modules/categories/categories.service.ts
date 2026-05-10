import { db } from '../../config/config';
import {
    GET_ALL_CATEGORIES,
    GET_CATEGORY_BY_ID,
    CREATE_CATEGORY,
    UPDATE_CATEGORY_BY_ID,
    DELETE_CATEGORY_BY_ID
} from '../../database/queries/categories.queries';

/**
 * Servicio para gestionar categorías.
 */
export const CategoriesService = {
    /**
     * Obtener todas las categorías registradas.
     * @returns {Promise<any[]>} Lista de categorías
     * @throws {Error} Si ocurre un error en la consulta
     * @example
     * const categories = await CategoriesService.getAllCategories();
     */
    async getAllCategories() {
        const [rows]: any = await db.query(GET_ALL_CATEGORIES);
        return rows;
    },

    /**
     * Obtener una categoría por su ID.
     * @param {number} id - ID de la categoría
     * @returns {Promise<any>} Categoría encontrada
     * @throws {Error} Si la categoría no existe o la consulta falla
     * @example
     * const category = await CategoriesService.getCategoryById(1);
     */
    async getCategoryById(id: number) {
        const [rows]: any = await db.query(GET_CATEGORY_BY_ID, [id]);

        if (!rows.length) {
        throw new Error('Categoría no encontrada');
        }

        return rows[0];
    },

    /**
     * Crear una nueva categoría.
     * @param {{ name: string; description?: string }} data - Datos de la categoría
     * @returns {Promise<any>} Categoría creada con su ID
     * @throws {Error} Si la inserción falla
     * @example
     * await CategoriesService.createCategory({
     *   name: 'Tecnología',
     *   description: 'Categoría relacionada con tecnología'
     * });
     */
    async createCategory(data: { name: string; description?: string }) {
        const result: any = await db.query(CREATE_CATEGORY, [
        data.name,
        data.description ?? null
        ]);

        return { id: result.insertId, ...data };
    },

    /**
     * Actualizar una categoría existente por su ID.
     * @param {number} id - ID de la categoría
     * @param {{ name?: string; description?: string }} updates - Campos a actualizar
     * @returns {Promise<any>} Categoría actualizada
     * @throws {Error} Si la categoría no existe o la actualización falla
     * @example
     * await CategoriesService.updateCategoryById(1, {
     *   name: 'Nueva categoría'
     * });
     */
    async updateCategoryById(id: number, updates: any) {
        const category = await this.getCategoryById(id);

        const updatedCategory = {
        name: updates.name ?? category.name,
        description: updates.description ?? category.description
        };

        await db.query(UPDATE_CATEGORY_BY_ID, [
        updatedCategory.name,
        updatedCategory.description,
        id
        ]);

        return { id, ...updatedCategory };
    },

    /**
     * Eliminar una categoría por su ID.
     * @param {number} id - ID de la categoría
     * @returns {Promise<{ message: string }>} Mensaje de confirmación
     * @throws {Error} Si la categoría no existe o la eliminación falla
     * @example
     * await CategoriesService.deleteCategoryById(1);
     */
    async deleteCategoryById(id: number) {
        await this.getCategoryById(id);

        await db.query(DELETE_CATEGORY_BY_ID, [id]);

        return {
        message: `Categoría con ID ${id} eliminada correctamente`
        };
    }
};