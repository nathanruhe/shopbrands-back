import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import addressesRoutes from './modules/addresses/addresses.routes';
import productsRoutes from './modules/products/products.routes';
import cartRoutes from './modules/cart/cart.routes';
import ordersRoutes from './modules/orders/orders.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';

/** 
 * Router principal de la API
 */
const router = Router();

/**
 * Ruta de prueba raíz
 * Verifica que la API esté funcionando
 */
router.get('/', (req, res) => {
    res.json({ message: 'API funcionando correctamente 🚀' });
});

/**
 * Rutas de módulos
 * Cada módulo tiene sus propias rutas encapsuladas
 */
router.use('/auth', authRoutes);        // Autenticación (login, register)
router.use('/users', usersRoutes);      // Gestión de usuarios
router.use('/addresses', addressesRoutes); // Gestión de direcciones
router.use('/products', productsRoutes); // Gestión de productos
router.use('/cart', cartRoutes);        // Gestión de carrito
router.use('/orders', ordersRoutes);     // Gestión de pedidos
router.use('/payments', paymentsRoutes); // Gestión de pagos
router.use('/dashboard', dashboardRoutes); // Dashboard / panel de administración
router.use('/notifications', notificationsRoutes); // Rutas de notificaciones

export default router;
