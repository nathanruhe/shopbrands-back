export const DashboardQueries = {
  /**
   * Resumen general del dashboard:
   * total de ventas, cantidad de pedidos, ticket promedio y total de usuarios
   * @constant
   * @type {string}
   * @example
   * const [overview] = await db.query(DashboardQueries.OVERVIEW);
   */
  OVERVIEW: `
    SELECT
      IFNULL(SUM(o.total), 0) AS total_sales,
      COUNT(o.id) AS total_orders,
      IFNULL(AVG(o.total), 0) AS avg_order_value,
      (SELECT COUNT(id) FROM users) AS total_users
    FROM orders o
    WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 5 YEAR);
  `,

  /**
   * Cantidad de pedidos agrupados por estado
   * @constant
   * @type {string}
   * @example
   * const statusCounts = await db.query(DashboardQueries.ORDERS_BY_STATUS);
   */
  ORDERS_BY_STATUS: `
    SELECT status, COUNT(*) AS count
    FROM orders
    GROUP BY status;
  `,

  /**
   * Pedidos recientes con información del cliente y dirección
   * @constant
   * @type {string}
   * @param {number} limit - Número máximo de pedidos a devolver
   * @example
   * const recentOrders = await db.query(DashboardQueries.RECENT_ORDERS, [10]);
   */
  RECENT_ORDERS: `
    SELECT
      o.id, o.user_id, o.total, o.status, o.created_at,
      u.first_name, u.last_name, u.email,
      a.street, a.city, a.province
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.address_id = a.id
    ORDER BY o.created_at DESC
    LIMIT ?;
  `,

  /**
   * Productos más vendidos con cantidad y total de ingresos
   * @constant
   * @type {string}
   * @param {number} limit - Número máximo de productos
   * @example
   * const topProducts = await db.query(DashboardQueries.TOP_PRODUCTS, [5]);
   */
  TOP_PRODUCTS: `
    SELECT
      p.id AS product_id, p.name AS product_name, p.image_url,
      SUM(oi.quantity) AS total_quantity,
      SUM(oi.quantity * oi.price) AS total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id
    ORDER BY total_quantity DESC
    LIMIT ?;
  `,

  /**
   * Ventas por día
   * @param {number} daysCount - Número de días a considerar (default: 30)
   * @returns {string} SQL dinámico
   * @example
   * const sql = DashboardQueries.SALES_BY_DAY(15);
   * const sales = await db.query(sql);
   */
  SALES_BY_DAY: (daysCount = 30) => `
    SELECT
      DATE(o.created_at) AS day,
      SUM(o.total) AS total_sales,
      COUNT(o.id) AS orders_count
    FROM orders o
    WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL ${Number(daysCount)} DAY)
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at) ASC;
  `,

  /**
   * Ventas por mes
   * @param {number} months - Número de meses a considerar (default: 6)
   * @returns {string} SQL dinámico
   * @example
   * const sql = DashboardQueries.SALES_BY_MONTH(3);
   * const monthlySales = await db.query(sql);
   */
  SALES_BY_MONTH: (months = 6) => `
    SELECT
      DATE_FORMAT(o.created_at, '%Y-%m') AS month,
      SUM(o.total) AS total_sales,
      COUNT(o.id) AS orders_count
    FROM orders o
    WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL ${Number(months)} MONTH)
    GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
    ORDER BY DATE_FORMAT(o.created_at, '%Y-%m') ASC;
  `,

  /**
   * Cantidad de usuarios registrados por día
   * @param {number} days - Número de días a considerar (default: 30)
   * @returns {string} SQL dinámico
   * @example
   * const sql = DashboardQueries.USERS_BY_DAY(7);
   * const dailyUsers = await db.query(sql);
   */
  USERS_BY_DAY: (days = 30) => `
    SELECT
      DATE(created_at) AS day,
      COUNT(id) AS users_count
    FROM users
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${Number(days)} DAY)
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC;
  `,

  /**
   * Pedidos filtrados dinámicamente con condiciones WHERE
   * @param {string} conditions - Condiciones SQL dinámicas para la cláusula WHERE
   * @returns {string} SQL dinámico
   * @example
   * const sql = DashboardQueries.FILTERED_ORDERS("WHERE status = 'completed'");
   * const completedOrders = await db.query(sql);
   */
  FILTERED_ORDERS: (conditions: string) => `
    SELECT
      o.id, o.user_id, o.total, o.status, o.created_at,
      u.first_name, u.last_name, u.email
    FROM orders o
    JOIN users u ON u.id = o.user_id
    ${conditions}
    ORDER BY o.created_at DESC;
  `,

  /**
   * Lista de usuarios con límite
   * @constant
   * @type {string}
   * @param {number} limit - Número máximo de usuarios
   * @example
   * const users = await db.query(DashboardQueries.USERS_LIST, [10]);
   */
  USERS_LIST: `
    SELECT id, first_name, last_name, email, role, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ?;
  `,

  /**
   * Opciones de estado de pedidos únicas para filtros
   * @constant
   * @type {string}
   */
  FILTER_OPTIONS_STATUS: `SELECT DISTINCT status FROM orders;`,

  /**
   * Opciones de métodos de pago únicas para filtros
   * @constant
   * @type {string}
   */
  FILTER_OPTIONS_METHODS: `SELECT DISTINCT method FROM payments;`,

  /**
   * Resumen de devoluciones: cantidad por estado y total aprobado
   * @constant
   * @type {string}
   * @example
   * const [returnsSummary] = await db.query(DashboardQueries.RETURNS_SUMMARY);
   */
  RETURNS_SUMMARY: `
    SELECT
      status,
      COUNT(*) AS count,
      SUM(total_amount) AS total_amount
    FROM returns
    GROUP BY status;
  `,

  /**
   * Obtener todas las solicitudes de devolución con estado del pedido y datos del usuario
   * @constant
   * @type {string}
   * @example
   * const allReturns = await db.query(DashboardQueries.GET_ALL_RETURNS);
   */
  GET_ALL_RETURNS: `
    SELECT r.*, o.status AS order_status, u.first_name, u.last_name, u.email
    FROM returns r
    LEFT JOIN orders o ON r.order_id = o.id
    LEFT JOIN users u ON r.user_id = u.id
  `,
};
