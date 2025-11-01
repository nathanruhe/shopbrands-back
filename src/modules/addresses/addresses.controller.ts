import { Response } from 'express';
import { AddressesService } from './addresses.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

/**
 * Crear una nueva dirección para el usuario autenticado.
 * Ruta: POST /api/addresses
 * 
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con user.id y body con datos de la dirección.
 * @param {Object} req.body - Datos de la dirección a crear.
 * @param {string} req.body.first_name - Nombre del destinatario.
 * @param {string} req.body.last_name - Apellido del destinatario.
 * @param {string} req.body.street - Calle y número.
 * @param {string} req.body.city - Ciudad.
 * @param {string} req.body.province - Provincia o estado.
 * @param {string} req.body.postal_code - Código postal.
 * @param {string} req.body.country - País.
 * @param {string} req.body.phone - Teléfono de contacto.
 * @param {string} [req.body.type] - Tipo de dirección (por defecto 'shipping').
 * @param {Response} res - Response de Express.
 * @returns {Promise<void>} Responde con JSON que contiene mensaje de éxito o error.
 * @throws {400} Si ocurre un error al crear la dirección.
 * @example
 * // POST /api/addresses
 * // Body: { first_name: 'Juan', last_name: 'Pérez', street: 'Calle 123', city: 'Madrid', ... }
 * await createAddress(req, res);
 */
export const createAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await AddressesService.createAddress(req.user!.id, req.body);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Obtener todas las direcciones del usuario autenticado.
 * Ruta: GET /api/addresses
 * 
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con user.id.
 * @param {Response} res - Response de Express.
 * @returns {Promise<void>} Responde con JSON que contiene un array de direcciones.
 * @throws {400} Si ocurre un error al obtener las direcciones.
 * @example
 * // GET /api/addresses
 * const addresses = await getUserAddresses(req, res);
 */
export const getUserAddresses = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const addresses = await AddressesService.getUserAddresses(req.user!.id);
        res.json(addresses);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualizar una dirección existente del usuario autenticado.
 * Ruta: PUT /api/addresses/:id
 * 
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con user.id y params.id de la dirección.
 * @param {Object} req.body - Campos a actualizar de la dirección.
 * @param {string} [req.body.first_name] - Nombre del destinatario.
 * @param {string} [req.body.last_name] - Apellido del destinatario.
 * @param {string} [req.body.street] - Calle y número.
 * @param {string} [req.body.city] - Ciudad.
 * @param {string} [req.body.province] - Provincia o estado.
 * @param {string} [req.body.postal_code] - Código postal.
 * @param {string} [req.body.country] - País.
 * @param {string} [req.body.phone] - Teléfono de contacto.
 * @param {string} [req.body.type] - Tipo de dirección.
 * @param {Response} res - Response de Express.
 * @returns {Promise<void>} Responde con JSON que contiene mensaje de éxito.
 * @throws {400} Si la dirección no existe o ocurre un error al actualizar.
 * @example
 * // PUT /api/addresses/5
 * await updateAddress(req, res);
 */
export const updateAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await AddressesService.updateAddress(
            req.user!.id,
            parseInt(req.params.id!),
            req.body
        );
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Eliminar una dirección del usuario autenticado.
 * Ruta: DELETE /api/addresses/:id
 * 
 * @async
 * @param {AuthenticatedRequest} req - Request autenticado con user.id y params.id de la dirección.
 * @param {Response} res - Response de Express.
 * @returns {Promise<void>} Responde con JSON que contiene mensaje de éxito.
 * @throws {400} Si ocurre un error al eliminar la dirección.
 * @example
 * // DELETE /api/addresses/5
 * await deleteAddress(req, res);
 */
export const deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await AddressesService.deleteAddress(req.user!.id, parseInt(req.params.id!));
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
