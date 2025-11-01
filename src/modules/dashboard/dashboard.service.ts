import { db } from '../../config/config';
import { DashboardQueries } from '../../database/queries/dashboard.queries';
import { RowDataPacket } from 'mysql2';

function formatDateLocal(input: any): string | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatMonthLocal(input: any): string | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export const DashboardService = {
  /**
   * Obtiene un resumen general del dashboard:
   * - Total de ventas
   * - Total de pedidos
   * - Ticket promedio
   * - Total de usuarios
   * @async
   * @returns {Promise<{total_sales:number, total_orders:number, avg_order_value:number, total_users:number}>}
   * @example
   * const overview = await DashboardService.getOverview();
   */
  async getOverview() {
    const [rows]: any = await db.query<RowDataPacket[]>(DashboardQueries.OVERVIEW);
    const r = rows[0] || {};
    return {
      total_sales: Number(r.total_sales || 0),
      total_orders: Number(r.total_orders || 0),
      avg_order_value: Number(r.avg_order_value || 0),
      total_users: Number(r.total_users || 0),
    };
  },

  /**
   * Obtiene la cantidad de pedidos agrupados por estado.
   * @async
   * @returns {Promise<Array<{status:string, count:number}>>} Lista de estados y cantidad de pedidos por cada uno.
   * @example
   * const ordersByStatus = await DashboardService.getOrdersByStatus();
   */
  async getOrdersByStatus() {
    const [rows]: any = await db.query<RowDataPacket[]>(DashboardQueries.ORDERS_BY_STATUS);
    return rows.map((r: any) => ({ status: r.status, count: Number(r.count) }));
  },

  /**
   * Obtiene los pedidos recientes con información de usuario y dirección.
   * @async
   * @param {number} [limit=10] Número máximo de pedidos a obtener.
   * @returns {Promise<Array<any>>} Lista de pedidos recientes.
   * @example
   * const recentOrders = await DashboardService.getRecentOrders(5);
   */
  async getRecentOrders(limit = 10) {
    const [rows]: any = await db.query<RowDataPacket[]>(DashboardQueries.RECENT_ORDERS, [limit]);

    // Normalizar formato de fecha (usando hora local para evitar shifts UTC)
    return rows.map((r: any) => ({
      ...r,
      created_at: formatDateLocal(r.created_at),
    }));
  },

  /**
   * Obtiene los productos más vendidos.
   * @async
   * @param {number} [limit=10] Número máximo de productos a retornar.
   * @returns {Promise<Array<any>>} Lista de productos con ventas.
   * @example
   * const topProducts = await DashboardService.getTopProducts(5);
   */
  async getTopProducts(limit = 10) {
    const [rows]: any = await db.query<RowDataPacket[]>(DashboardQueries.TOP_PRODUCTS, [limit]);
    return rows;
  },

  /**
   * Obtiene ventas diarias en los últimos 'days' días.
   * @async
   * @param {number} [days=30] Número de días a considerar.
   * @returns {Promise<Array<{day:string|null, total_sales:number, orders_count:number}>>}
   * @example
   * const salesByDay = await DashboardService.getSalesByDay(7);
   */
  async getSalesByDay(days = 30) {
    const sql = DashboardQueries.SALES_BY_DAY(days);
    const [rows]: any = await db.query<RowDataPacket[]>(sql);

    // Formateamos la fecha usando la hora local (YYYY-MM-DD) para evitar desplazamientos de día
    return rows.map((r: any) => ({
      day: formatDateLocal(r.day),
      total_sales: Number(r.total_sales || 0),
      orders_count: Number(r.orders_count || 0),
    }));
  },

  /**
   * Obtiene ventas mensuales en los últimos 'months' meses.
   * @async
   * @param {number} [months=6] Número de meses a considerar.
   * @returns {Promise<Array<{month:string|null, total_sales:number, orders_count:number}>>}
   * @example
   * const salesByMonth = await DashboardService.getSalesByMonth(3);
   */
  async getSalesByMonth(months = 6) {
    const sql = DashboardQueries.SALES_BY_MONTH(months);
    const [rows]: any = await db.query<RowDataPacket[]>(sql);

    return rows.map((r: any) => ({
      // r.month puede venir como string '2025-10' o como Date -> normalizamos
      month: formatMonthLocal(r.month),
      total_sales: Number(r.total_sales || 0),
      orders_count: Number(r.orders_count || 0),
    }));
  },

  /**
   * Obtiene cantidad de usuarios registrados por día en los últimos 'days' días.
   * @async
   * @param {number} [days=30] Número de días a considerar.
   * @returns {Promise<Array<{day:string|null, users_count:number}>>}
   * @example
   * const usersByDay = await DashboardService.getUsersByDay(15);
   */
  async getUsersByDay(days = 30) {
    const sql = DashboardQueries.USERS_BY_DAY(days);
    const [rows]: any = await db.query<RowDataPacket[]>(sql);

    return rows.map((r: any) => ({
      day: formatDateLocal(r.day),
      users_count: Number(r.users_count || 0),
    }));
  },

  /**
   * Obtiene pedidos filtrados por distintos criterios.
   * @async
   * @param {Object} filters - Filtros disponibles.
   * @param {string} [filters.status] Estado del pedido.
   * @param {number} [filters.userId] ID del usuario.
   * @param {string} [filters.start] Fecha inicio (YYYY-MM-DD).
   * @param {string} [filters.end] Fecha fin (YYYY-MM-DD).
   * @returns {Promise<Array<any>>} Lista de pedidos filtrados.
   * @example
   * const filteredOrders = await DashboardService.getOrdersFiltered({ status: 'pending', userId: 2 });
   */
  async getOrdersFiltered(filters: any) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.status) {
      conditions.push('o.status = ?');
      values.push(filters.status);
    }
    if (filters.userId) {
      conditions.push('o.user_id = ?');
      values.push(filters.userId);
    }
    if (filters.start && filters.end) {
      conditions.push('DATE(o.created_at) BETWEEN ? AND ?');
      values.push(filters.start, filters.end);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = DashboardQueries.FILTERED_ORDERS(where);
    const [rows]: any = await db.query<RowDataPacket[]>(sql, values);

    // Normalizar formato de fecha de pedidos (local)
    return rows.map((r: any) => ({
      ...r,
      created_at: formatDateLocal(r.created_at),
    }));
  },

  /**
   * Obtiene una lista de usuarios limitada por 'limit'.
   * @async
   * @param {number} [limit=50] Número máximo de usuarios a retornar.
   * @returns {Promise<Array<any>>} Lista de usuarios.
   * @example
   * const users = await DashboardService.getUsersList(20);
   */
  async getUsersList(limit = 50) {
    const [rows]: any = await db.query<RowDataPacket[]>(DashboardQueries.USERS_LIST, [limit]);
    return rows.map((r: any) => ({
      ...r,
      created_at: formatDateLocal(r.created_at),
    }));
  },

  /**
   * Obtiene opciones únicas para filtros de estado de pedidos y métodos de pago.
   * @async
   * @returns {Promise<{statuses:string[], payment_methods:string[]}>} Objetos con listas de estados y métodos.
   * @example
   * const filters = await DashboardService.getFilterOptions();
   */
  async getFilterOptions() {
    const [statuses]: any = await db.query<RowDataPacket[]>(DashboardQueries.FILTER_OPTIONS_STATUS);
    const [methods]: any = await db.query<RowDataPacket[]>(DashboardQueries.FILTER_OPTIONS_METHODS);

    return {
      statuses: statuses.map((r: any) => r.status),
      payment_methods: methods.map((r: any) => r.method),
    };
  },

  /**
   * Obtiene un resumen de devoluciones por estado y total aprobado.
   * @async
   * @returns {Promise<{pending:number, approved:number, rejected:number, total_amount_returned:number}>}
   * @example
   * const returnsSummary = await DashboardService.getReturnsSummary();
   */
  async getReturnsSummary() {
    type ReturnStatus = 'pending' | 'approved' | 'rejected';

    const summary: Record<ReturnStatus | 'total_amount_returned', number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total_amount_returned: 0,
    };

    const [rows]: any = await db.query(DashboardQueries.RETURNS_SUMMARY);

    rows.forEach((r: any) => {
      const status = r.status as ReturnStatus;
      summary[status] = Number(r.count);
      if (status === 'approved') summary.total_amount_returned += Number(r.total_amount || 0);
    });

    return summary;
  },

  /**
   * Obtiene todas las devoluciones.
   * @async
   * @returns {Promise<Array<any>>} Lista de devoluciones con fecha normalizada.
   * @example
   * const allReturns = await DashboardService.getAllReturns();
   */
  async getAllReturns() {
    const [rows]: any = await db.query<RowDataPacket[]>(DashboardQueries.GET_ALL_RETURNS);
    return rows.map((r: any) => ({
      ...r,
      created_at: formatDateLocal(r.created_at),
    }));
  },
};