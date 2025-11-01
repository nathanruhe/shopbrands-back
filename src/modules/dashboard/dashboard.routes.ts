import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * Todas las rutas del módulo Dashbaord requieren:
 *  - Usuario autenticado (authenticate)
 *  - Rol de administrador (authorize('admin'))
*/

/**
 * @route GET /dashboard/overview
 * @desc Obtiene métricas principales del dashboard: total ventas, pedidos, ticket promedio y total usuarios.
 * @access Admin
 * @returns {Object} { total_sales: number, total_orders: number, avg_order_value: number, total_users: number }
 * @throws 500 Error al obtener overview
 */
router.get('/overview', authenticate, authorize('admin'), DashboardController.overview);

/**
 * @route GET /dashboard/orders-by-status
 * @desc Cantidad de pedidos agrupados por estado
 * @access Admin
 * @returns {Array<{status:string,count:number}>}
 * @throws 500 Error al obtener los datos
 */
router.get('/orders-by-status', authenticate, authorize('admin'), DashboardController.ordersByStatus);

/**
 * @route GET /dashboard/recent-orders
 * @desc Pedidos recientes con información de usuario y dirección
 * @query {number} limit Número máximo de pedidos a devolver (opcional, default 10)
 * @access Admin
 * @returns {Array<Object>} Pedidos recientes
 * @throws 500 Error al obtener pedidos recientes
 */
router.get('/recent-orders', authenticate, authorize('admin'), DashboardController.recentOrders);

/**
 * @route GET /dashboard/top-products
 * @desc Productos más vendidos
 * @query {number} limit Número máximo de productos a devolver (opcional, default 10)
 * @access Admin
 * @returns {Array<Object>} Productos con ventas
 * @throws 500 Error al obtener productos
 */
router.get('/top-products', authenticate, authorize('admin'), DashboardController.topProducts);

/**
 * @route GET /dashboard/sales-by-day
 * @desc Ventas diarias
 * @query {number} days Número de días a considerar (opcional, default 30)
 * @access Admin
 * @returns {Array<{day:string|null,total_sales:number,orders_count:number}>}
 * @throws 500 Error al obtener ventas diarias
 */
router.get('/sales-by-day', authenticate, authorize('admin'), DashboardController.salesByDay);

/**
 * @route GET /dashboard/sales-by-month
 * @desc Ventas mensuales
 * @query {number} months Número de meses a considerar (opcional, default 6)
 * @access Admin
 * @returns {Array<{month:string|null,total_sales:number,orders_count:number}>}
 * @throws 500 Error al obtener ventas mensuales
 */
router.get('/sales-by-month', authenticate, authorize('admin'), DashboardController.salesByMonth);

/**
 * @route GET /dashboard/users-by-day
 * @desc Usuarios registrados por día
 * @query {number} days Número de días a considerar (opcional, default 30)
 * @access Admin
 * @returns {Array<{day:string|null,users_count:number}>}
 * @throws 500 Error al obtener datos de usuarios
 */
router.get('/users-by-day', authenticate, authorize('admin'), DashboardController.usersByDay);

/**
 * @route GET /dashboard/orders
 * @desc Pedidos filtrados por estado, rango de fechas o usuario
 * @query {string} status Estado del pedido (opcional)
 * @query {string} start Fecha de inicio (opcional)
 * @query {string} end Fecha de fin (opcional)
 * @query {number} userId ID del usuario (opcional)
 * @access Admin
 * @returns {Array<Object>} Pedidos filtrados
 * @throws 500 Error al obtener pedidos filtrados
 */
router.get('/orders', authenticate, authorize('admin'), DashboardController.ordersFiltered);

/**
 * @route GET /dashboard/users
 * @desc Lista de usuarios
 * @query {number} limit Número máximo de usuarios a devolver (opcional, default 50)
 * @access Admin
 * @returns {Array<Object>} Usuarios
 * @throws 500 Error al obtener usuarios
 */
router.get('/users', authenticate, authorize('admin'), DashboardController.getUsersList);

/**
 * @route GET /dashboard/filters
 * @desc Opciones para filtros del dashboard (estados de pedidos y métodos de pago)
 * @access Admin
 * @returns {Object} { statuses: string[], payment_methods: string[] }
 * @throws 500 Error al obtener filtros
 */
router.get('/filters', authenticate, authorize('admin'), DashboardController.getFilterOptions);

/**
 * @route GET /dashboard/returns-summary
 * @desc Resumen de devoluciones: cantidad por estado y total aprobado
 * @access Admin
 * @returns {Object} { pending:number, approved:number, rejected:number, total_amount_returned:number }
 * @throws 500 Error al obtener resumen de devoluciones
 */
router.get('/returns-summary', authenticate, authorize('admin'), DashboardController.returnsSummary);

/**
 * @route GET /dashboard/returns
 * @desc Todas las devoluciones
 * @access Admin
 * @returns {Array<Object>} Devoluciones con fechas normalizadas
 * @throws 500 Error al obtener devoluciones
 */
router.get('/returns', authenticate, authorize('admin'), DashboardController.allReturns);

export default router;
