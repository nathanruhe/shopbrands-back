import fs from 'fs';
import path from 'path';
import { db, BASE_URL } from '../../config/config';
import { 
    CREATE_PRODUCT, GET_PRODUCT_BY_ID, UPDATE_PRODUCT_BY_ID, DELETE_PRODUCT_BY_ID, GET_ALL_PRODUCTS,
    ADD_PRODUCT_CATEGORIES, GET_PRODUCTS_BY_CATEGORIES_AND
} from '../../database/queries/products.queries';
import { notifyUsersNewProduct } from '../../utils/notifications.util';

/**
 * Opciones para obtener productos
 */
export interface GetProductsOptions {
    categoryIds?: number[];
    limit?: number;
    offset?: number;
}

const UPLOADS_FOLDER = path.join(process.cwd(), 'src/modules/products/uploads');

/**
 * Parsea categorías desde string o array a array de números
 * @param input string | any[]
 * @returns {number[] | undefined} Array de IDs de categorías o undefined si no hay
 */
function parseCategories(input: any): number[] | undefined {
    if (Array.isArray(input)) return input.map((v: any) => Number(v)).filter((n: number) => !Number.isNaN(n));
    if (typeof input === 'string' && input.trim().length) {
        return input.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
    }
    return undefined;
}

export const ProductsService = {
    /**
     * Crea un producto en la base de datos y asocia categorías.
     * También envía notificación a usuarios conectados.
     * @param {object} data - Datos del producto
     * @param {string} data.name - Nombre del producto
     * @param {string} [data.description] - Descripción del producto
     * @param {string} [data.image_url] - URL de la imagen
     * @param {number} [data.price] - Precio
     * @param {number} [data.stock] - Stock disponible
     * @param {string} [data.size] - Tamaño
     * @param {string} [data.color] - Color
     * @param {string} [data.sku] - SKU
     * @param {string | number[]} [data.categories] - Categorías a asociar
     * @returns {Promise<{ message: string, id: number }>} Confirmación de creación
     */
    async createProduct(data: any) {
        const { name, description, image_url, price, stock, size, color, sku } = data;
        const categories = parseCategories(data.categories);

        const filename = image_url ? String(image_url).split('/').pop() : null;

        const [result]: any = await db.query(CREATE_PRODUCT, [
            name,
            description || null,
            filename || null,
            price ?? null,
            stock ?? 0,
            size || null,
            color || null,
            sku || null
        ]);
        const productId = result.insertId;

        // Asociar categorías al producto
        if (categories && categories.length) {
            const values = categories.map((catId: number) => [productId, catId]);
            await db.query(ADD_PRODUCT_CATEGORIES, [values]);
        }

        // Notificación a todos los usuarios conectados
        notifyUsersNewProduct(`Nuevo producto disponible: ${name}`);

        return { message: 'Producto creado correctamente', id: productId };
    },

    /**
     * Obtiene un producto por ID con categorías e imagen completa
     * @param {number} id - ID del producto
     * @returns {Promise<any>} Producto completo
     * @throws {Error} Si el producto no existe
     */
    async getProduct(id: number) {
        const [rows]: any = await db.query(GET_PRODUCT_BY_ID, [id]);
        if (!rows.length) throw new Error('Producto no encontrado');

        const product = rows[0];

        // Parsear categorías JSON
        try { if (typeof product.categories === 'string') product.categories = JSON.parse(product.categories); } catch {}

        // Agregar URL completa de imagen
        if (product.image_url) product.image_url = `${BASE_URL}/uploads/${product.image_url}`;
        return product;
    },

    /**
     * Obtiene todos los productos, opcionalmente filtrados por categorías, con paginación
     * @param {GetProductsOptions} [options] - Opciones de filtrado y paginación
     * @returns {Promise<any[]>} Lista de productos
     */
    async getAllProducts(options?: GetProductsOptions) {
        const categoryIds = options?.categoryIds ?? [];
        const limit = options?.limit;
        const offset = options?.offset;
        let rows: any;

        if (Array.isArray(categoryIds) && categoryIds.length) {
            const query = GET_PRODUCTS_BY_CATEGORIES_AND(categoryIds, limit, offset);
            [rows] = await db.query(query);
        } else {
            let sql = GET_ALL_PRODUCTS;
            if (typeof limit === 'number' && limit > 0) sql += ` LIMIT ${limit}`;
            if (typeof offset === 'number' && offset >= 0) sql += ` OFFSET ${offset}`;
            [rows] = await db.query(sql);
        }

        rows = rows.map((p: any) => {
            try { if (typeof p.categories === 'string') p.categories = JSON.parse(p.categories); } catch {}
            if (p.image_url) p.image_url = `${BASE_URL}/uploads/${p.image_url}`;
            return p;
        });

        return rows;
    },

    /**
     * Actualiza un producto y sus categorías
     * Borra imagen anterior si se reemplaza
     * @param {number} id - ID del producto
     * @param {object} data - Campos a actualizar
     * @param {string | number[]} [data.categories] - Categorías a actualizar
     * @returns {Promise<any>} Producto actualizado
     */
    async updateProduct(id: number, data: any) {
        const categories = parseCategories(data.categories);
        const rawImage = data.image_url ?? null;

        // Borrar imagen anterior si hay nueva imagen
        if (rawImage) {
            const [rows]: any = await db.query(`SELECT image_url FROM products WHERE id = ?`, [id]);
            if (rows.length && rows[0].image_url) {
                const oldFilename = rows[0].image_url;
                const oldFilePath = path.join(UPLOADS_FOLDER, oldFilename);
                try { if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath); } catch (err) {
                    console.warn('⚠️ Error al borrar imagen anterior:', err);
                }
            }
        }

        // Construcción dinámica de UPDATE
        const updatableFields = ['name','description','image_url','price','stock','size','color','sku'];
        const setClauses: string[] = [];
        const params: any[] = [];

        for (const field of updatableFields) {
            if (Object.prototype.hasOwnProperty.call(data, field)) {
                let value = (data as any)[field];
                if (field === 'image_url' && value) value = String(value).split('/').pop();
                setClauses.push(`${field} = ?`);
                params.push(value === '' ? null : value);
            }
        }

        if (setClauses.length) {
            const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`;
            params.push(id);
            await db.query(sql, params);
        }

        // Actualizar categorías
        if (categories) {
            await db.query(`DELETE FROM product_categories WHERE product_id = ?`, [id]);
            if (categories.length) {
                const values = categories.map((catId: number) => [id, catId]);
                await db.query(ADD_PRODUCT_CATEGORIES, [values]);
            }
        }

        return await this.getProduct(id);
    },

    /**
     * Elimina un producto y su imagen asociada
     * @param {number} id - ID del producto
     * @returns {Promise<{ message: string }>} Confirmación de eliminación
     */
    async deleteProduct(id: number) {
        const [rows]: any = await db.query(`SELECT image_url FROM products WHERE id = ?`, [id]);
        if (rows.length && rows[0].image_url) {
            const filename = String(rows[0].image_url);
            const filePath = path.join(UPLOADS_FOLDER, filename);
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (err) {
                console.warn('⚠️ Error al borrar la imagen del producto:', err);
            }
        }

        await db.query(DELETE_PRODUCT_BY_ID, [id]);
        return { message: 'Producto eliminado correctamente' };
    }
};
