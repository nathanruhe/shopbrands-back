import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export const DashboardController = {
  /**
   * Obtener métricas principales del dashboard: total de ventas, cantidad de pedidos,
   * ticket promedio y total de usuarios.
   * @route GET /dashboard/overview
   * @param {Request} req - Objeto Express Request.
   * @param {Response} res - Objeto Express Response.
   * @returns {Promise<void>} Devuelve JSON con { total_sales, total_orders, avg_order_value, total_users }.
   * @throws {500} Si ocurre un error al obtener el overview.
   * @example
   * GET /dashboard/overview
   */
  async overview(req: Request, res: Response) {
    try {
      const data = await DashboardService.getOverview();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Error obteniendo overview' });
    }
  },

  /**
   * Obtener la cantidad de pedidos agrupados por estado.
   * @route GET /dashboard/orders-by-status
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>} JSON con array [{ status: string, count: number }]
   * @throws {500} Si ocurre un error al obtener los datos.
   */
  async ordersByStatus(req: Request, res: Response) {
    try {
      const data = await DashboardService.getOrdersByStatus();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  /**
   * Obtener los pedidos más recientes con información de usuario y dirección.
   * @route GET /dashboard/recent-orders
   * @param {Request} req - Puede incluir query param `limit` (opcional, default 10).
   * @param {Response} res
   * @returns {Promise<void>} Array de pedidos recientes.
   * @throws {500} Si ocurre un error al obtener los pedidos.
   * @example
   * GET /dashboard/recent-orders?limit=5
   */
  async recentOrders(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await DashboardService.getRecentOrders(limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  /**
   * Obtener los productos más vendidos.
   * @route GET /dashboard/top-products
   * @param {Request} req - Puede incluir query param `limit` (opcional, default 10).
   * @param {Response} res
   * @returns {Promise<void>} Array de productos con cantidad vendida.
   * @throws {500} Si ocurre un error al obtener los productos.
   */
  async topProducts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await DashboardService.getTopProducts(limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  /**
   * Obtener ventas por día.
   * @route GET /dashboard/sales-by-day
   * @param {Request} req - Query param `days` opcional (default 30).
   * @param {Response} res
   * @returns {Promise<void>} Array [{ day: string|null, total_sales: number, orders_count: number }]
   * @throws {500} Si ocurre un error al obtener ventas.
   */
  async salesByDay(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await DashboardService.getSalesByDay(days);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  /**
   * Obtener ventas por mes.
   * @route GET /dashboard/sales-by-month
   * @param {Request} req - Query param `months` opcional (default 6).
   * @param {Response} res
   * @returns {Promise<void>} Array [{ month: string|null, total_sales: number, orders_count: number }]
   * @throws {500} Si ocurre un error al obtener ventas mensuales.
   */
  async salesByMonth(req: Request, res: Response) {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const data = await DashboardService.getSalesByMonth(months);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  /**
   * Obtener cantidad de usuarios registrados por día.
   * @route GET /dashboard/users-by-day
   * @param {Request} req - Query param `days` opcional (default 30).
   * @param {Response} res
   * @returns {Promise<void>} Array [{ day: string|null, users_count: number }]
   * @throws {500} Si ocurre un error al obtener los datos.
   */
  async usersByDay(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await DashboardService.getUsersByDay(days);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  /**
   * Obtener pedidos filtrados por estado, usuario o rango de fechas.
   * @route GET /dashboard/orders
   * @param {Request} req - Query params: status, start, end, userId (todos opcionales)
   * @param {Response} res
   * @returns {Promise<void>} Array de pedidos filtrados.
   * @throws {500} Si ocurre un error al obtener los pedidos filtrados.
   * @example
   * GET /dashboard/orders?status=pending&userId=2&start=2025-10-01&end=2025-10-31
   */
  async ordersFiltered(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        start: req.query.start as string,
        end: req.query.end as string,
        userId: req.query.userId ? Number(req.query.userId) : undefined,
      };
      const data = await DashboardService.getOrdersFiltered(filters);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Error obteniendo pedidos filtrados' });
    }
  },

  /**
   * Obtener lista de usuarios.
   * @route GET /dashboard/users
   * @param {Request} req - Query param `limit` opcional (default 50).
   * @param {Response} res
   * @returns {Promise<void>} Array de usuarios.
   * @throws {500} Si ocurre un error al obtener los usuarios.
   */
  async getUsersList(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const data = await DashboardService.getUsersList(limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Error obteniendo usuarios' });
    }
  },

  /**
   * Obtener opciones para filtros del dashboard (estado de pedidos y métodos de pago).
   * @route GET /dashboard/filters
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>} Objeto { statuses: string[], payment_methods: string[] }.
   * @throws {500} Si ocurre un error al obtener los filtros.
   */
  async getFilterOptions(req: Request, res: Response) {
    try {
      const data = await DashboardService.getFilterOptions();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Error obteniendo filtros' });
    }
  },

  /**
   * Obtener resumen de devoluciones: cantidad por estado y total aprobado.
   * @route GET /dashboard/returns-summary
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>} Objeto { pending, approved, rejected, total_amount_returned }.
   * @throws {500} Si ocurre un error al obtener el resumen.
   */
  async returnsSummary(req: Request, res: Response) {
    try {
      const data = await DashboardService.getReturnsSummary();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Error obteniendo resumen de devoluciones' });
    }
  },

  /**
   * Obtener todas las devoluciones.
   * @route GET /dashboard/returns
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>} Array de devoluciones con fechas normalizadas.
   * @throws {500} Si ocurre un error al obtener devoluciones.
   */
  async allReturns(req: Request, res: Response) {
    try {
      const data = await DashboardService.getAllReturns();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Error obteniendo devoluciones' });
    }
  },
};
