import { db } from '../../config/config';
import { CREATE_ADDRESS, GET_ADDRESSES_BY_USER, UPDATE_ADDRESS_BY_ID, DELETE_ADDRESS_BY_ID, GET_ADDRESS_BY_ID } from '../../database/queries/addresses.queries';

export const AddressesService = {
    /**
     * Crear una nueva dirección asociada al usuario.
     * 
     * @async
     * @param {number} userId - ID del usuario autenticado.
     * @param {Object} data - Objeto con los datos de la dirección.
     * @param {string} data.first_name - Nombre del destinatario.
     * @param {string} data.last_name - Apellido del destinatario.
     * @param {string} data.street - Calle y número.
     * @param {string} data.city - Ciudad.
     * @param {string} data.province - Provincia o estado.
     * @param {string} data.postal_code - Código postal.
     * @param {string} data.country - País.
     * @param {string} data.phone - Teléfono de contacto.
     * @param {string} [data.type] - Tipo de dirección (por defecto 'shipping').
     * @returns {Promise<{ message: string }>} Mensaje de éxito.
     * @example
     * await AddressesService.createAddress(1, {
     *   first_name: 'Juan',
     *   last_name: 'Pérez',
     *   street: 'Calle Falsa 123',
     *   city: 'Madrid',
     *   province: 'Madrid',
     *   postal_code: '28000',
     *   country: 'España',
     *   phone: '555-1234'
     * });
     */
    async createAddress(userId: number, data: any) {
        const { first_name, last_name, street, city, province, postal_code, country, phone, type } = data;

        await db.query(CREATE_ADDRESS, [
            userId,
            first_name, 
            last_name,
            street,
            city,
            province,
            postal_code,
            country,
            phone,
            type || 'shipping'
        ]);

        return { message: 'Dirección añadida correctamente' };
    },

    /**
     * Obtener todas las direcciones del usuario autenticado.
     * 
     * @async
     * @param {number} userId - ID del usuario autenticado.
     * @returns {Promise<Array<Object>>} Lista de direcciones.
     * @example
     * const addresses = await AddressesService.getUserAddresses(1);
     * console.log(addresses);
     */
    async getUserAddresses(userId: number) {
        const [rows]: any = await db.query(GET_ADDRESSES_BY_USER, [userId]);
        return rows;
    },

    /**
     * Actualizar una dirección del usuario (actualización parcial).
     * Solo se actualizan los campos enviados en `data`.
     * 
     * @async
     * @param {number} userId - ID del usuario autenticado.
     * @param {number} addressId - ID de la dirección a actualizar.
     * @param {Object} data - Campos a actualizar.
     * @param {string} [data.first_name] - Nombre del destinatario.
     * @param {string} [data.last_name] - Apellido del destinatario.
     * @param {string} [data.street] - Calle y número.
     * @param {string} [data.city] - Ciudad.
     * @param {string} [data.province] - Provincia o estado.
     * @param {string} [data.postal_code] - Código postal.
     * @param {string} [data.country] - País.
     * @param {string} [data.phone] - Teléfono de contacto.
     * @param {string} [data.type] - Tipo de dirección.
     * @returns {Promise<{ message: string }>} Mensaje de éxito.
     * @throws {Error} Si la dirección no existe o no pertenece al usuario.
     * @example
     * await AddressesService.updateAddress(1, 5, { city: 'Barcelona', postal_code: '08001' });
     */
    async updateAddress(userId: number, addressId: number, data: any) {
        const [rows]: any = await db.query(GET_ADDRESS_BY_ID, [addressId, userId]);
        if (!rows.length) throw new Error('Dirección no encontrada');

        const address = rows[0];

        // Actualiza solo los campos enviados
        const updated = {
            first_name: data.first_name ?? address.first_name,
            last_name: data.last_name ?? address.last_name,
            street: data.street ?? address.street,
            city: data.city ?? address.city,
            province: data.province ?? address.province,
            postal_code: data.postal_code ?? address.postal_code,
            country: data.country ?? address.country,
            phone: data.phone ?? address.phone,
            type: data.type ?? address.type
        };

        await db.query(UPDATE_ADDRESS_BY_ID, [
            updated.first_name,
            updated.last_name,
            updated.street,
            updated.city,
            updated.province,
            updated.postal_code,
            updated.country,
            updated.phone,
            updated.type,
            addressId,
            userId
        ]);

        return { message: 'Dirección actualizada correctamente' };
    },

    /**
     * Eliminar una dirección del usuario.
     * 
     * @async
     * @param {number} userId - ID del usuario autenticado.
     * @param {number} addressId - ID de la dirección a eliminar.
     * @returns {Promise<{ message: string }>} Mensaje de éxito.
     * @example
     * await AddressesService.deleteAddress(1, 5);
     */
    async deleteAddress(userId: number, addressId: number) {
        await db.query(DELETE_ADDRESS_BY_ID, [addressId, userId]);
        return { message: 'Dirección eliminada correctamente' };
    }
};
