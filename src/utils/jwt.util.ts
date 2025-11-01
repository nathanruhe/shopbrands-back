import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWT_KEY } from '../config/config';

/**
 * Define la estructura base del payload que se almacena dentro del token JWT.
 */
export interface JwtPayload {
    id: number;
    role: string;
}

// Aseguramos que JWT_KEY siempre tenga un valor
const secret: Secret = JWT_KEY;

/**
 * @function signJwt
 * @summary Genera un token JWT firmado con el secreto del servidor.
 * @description
 * Crea un token JWT con el payload proporcionado y un tiempo de expiración definido.
 * 
 * Este token puede ser usado para autenticar peticiones a rutas protegidas.
 *
 * @param {object} payload - Datos que se incluirán en el token (ejemplo: `{ id, role }`).
 * @param {SignOptions['expiresIn']} [expiresIn='1d'] - Tiempo de expiración del token.  
 *   Acepta formatos como `'1h'`, `'7d'`, `'30m'`, etc.
 * @returns {string} Token JWT firmado.
 *
 * @example
 * ```ts
 * import { signJwt } from '../utils/jwt.util';
 * const token = signJwt({ id: 5, role: 'admin' }, '2h');
 * console.log(token); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * ```
 */
export function signJwt(payload: object, expiresIn: SignOptions['expiresIn'] = '1d'): string {
    return jwt.sign(payload, secret, { expiresIn });
}

/**
 * @function verifyJwt
 * @summary Verifica y decodifica un token JWT.
 * @description
 * Valida un token firmado previamente con el mismo secreto (`JWT_KEY`) y devuelve su payload decodificado.
 * 
 * Si el token ha expirado o es inválido, lanzará una excepción que puede ser capturada en un middleware de autenticación.
 *
 * @template T - Tipo genérico del payload esperado.  
 *   Por defecto, se utiliza `JwtPayload`.
 * 
 * @param {string} token - Token JWT a verificar.
 * @returns {T} Payload decodificado del token.
 * @throws {Error} Si el token no es válido o ha expirado.
 *
 * @example
 * ```ts
 * import { verifyJwt } from '../utils/jwt.util';
 * 
 * try {
 *   const payload = verifyJwt<{ id: number; role: string }>(token);
 *   console.log(payload.id, payload.role);
 * } catch (error) {
 *   console.error('Token inválido o expirado:', error.message);
 * }
 * ```
 */
export function verifyJwt<T = JwtPayload>(token: string): T {
    return jwt.verify(token, secret) as T;
}
