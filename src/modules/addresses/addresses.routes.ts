import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import {
    createAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress
} from './addresses.controller';

const router = Router();

/**
 * Crear una nueva dirección para el usuario autenticado.
 * Ruta: POST /api/addresses
 * @route POST /api/addresses
 * @desc Crear una nueva dirección para el usuario autenticado.
 * @access Private (requiere token)
 * @async
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
 * @returns {Promise<void>} JSON con mensaje de éxito o error.
 * @throws {400} Si ocurre un error al crear la dirección.
 */
router.post('/', authenticate, createAddress);

/**
 * Obtener todas las direcciones del usuario autenticado.
 * Ruta: GET /api/addresses
 * @route GET /api/addresses
 * @desc Retorna todas las direcciones asociadas al usuario autenticado.
 * @access Private (requiere token)
 * @async
 * @returns {Promise<void>} JSON con array de direcciones del usuario.
 * @throws {400} Si ocurre un error al obtener las direcciones.
 */
router.get('/', authenticate, getUserAddresses);

/**
 * Actualizar una dirección existente del usuario autenticado.
 * Ruta: PUT /api/addresses/:id
 * @route PUT /api/addresses/:id
 * @desc Actualiza los campos proporcionados de una dirección del usuario.
 * @access Private (requiere token)
 * @async
 * @param {string} req.params.id - ID de la dirección a actualizar.
 * @param {Object} req.body - Campos a actualizar (parciales).
 * @param {string} [req.body.first_name] - Nombre del destinatario.
 * @param {string} [req.body.last_name] - Apellido del destinatario.
 * @param {string} [req.body.street] - Calle y número.
 * @param {string} [req.body.city] - Ciudad.
 * @param {string} [req.body.province] - Provincia o estado.
 * @param {string} [req.body.postal_code] - Código postal.
 * @param {string} [req.body.country] - País.
 * @param {string} [req.body.phone] - Teléfono de contacto.
 * @param {string} [req.body.type] - Tipo de dirección.
 * @returns {Promise<void>} JSON con mensaje de éxito.
 * @throws {400} Si la dirección no existe o ocurre un error al actualizar.
 */
router.put('/:id', authenticate, updateAddress);

/**
 * Eliminar una dirección del usuario autenticado.
 * Ruta: DELETE /api/addresses/:id
 * @route DELETE /api/addresses/:id
 * @desc Elimina la dirección especificada del usuario.
 * @access Private (requiere token)
 * @async
 * @param {string} req.params.id - ID de la dirección a eliminar.
 * @returns {Promise<void>} JSON con mensaje de éxito.
 * @throws {400} Si ocurre un error al eliminar la dirección.
 */
router.delete('/:id', authenticate, deleteAddress);

export default router;
