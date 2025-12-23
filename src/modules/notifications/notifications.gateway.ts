import { Server, Socket } from 'socket.io';
import { verifyJwt } from '../../utils/jwt.util';

/**
 * Gateway para manejar notificaciones en tiempo real mediante WebSockets (Socket.IO)
*/
class NotificationsGateway {
    private io!: Server;

    /**
     * Inicializa el servidor de WebSocket (Socket.IO)
     * y configura la conexión de clientes.
     * @param server Servidor HTTP/Express sobre el cual se monta Socket.IO
     * @returns void
     * @example
     * notificationsGateway.init(httpServer);
     */
    public init(server: any) {
        this.io = new Server(server, {
            cors: { origin: '*' }, // Permitir conexiones desde cualquier origen
        });

        // Middleware de autenticación para sockets: verifica token en handshake.auth.token
        this.io.use((socket: Socket, next) => {
            try {
                const token = (socket.handshake.auth && socket.handshake.auth.token) || '';
                if (!token) return next(); // No obligatorio: permitir guests si quieres (no se unirán a rooms)
                // token can be raw token string (no "Bearer "), adapt if you send "Bearer ..."
                const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
                const payload = verifyJwt<any>(cleanToken);
                socket.data.user = payload; // { id, role }
                return next();
            } catch (err) {
                // Si quieres bloquear conexiones sin token inválido:
                // return next(new Error('invalid token'));
                // Por ahora sólo permitimos la conexión sin user.
                return next();
            }
        });

        this.io.on('connection', (socket: Socket) => {
            console.log(`🔔 Usuario conectado: ${socket.id}`, socket.data.user ?? '(guest)');

            // Si el socket está autenticado y es admin, lo añadimos al room 'admins'
            const user = socket.data.user;
            if (user && user.role === 'admin') {
                socket.join('admins');
                console.log(`➡️ Socket ${socket.id} unido a room 'admins'`);
            } else if (user) {
                // opcional: separar room 'users'
                socket.join('users');
            }

            socket.on('disconnect', () => {
                console.log(`❌ Usuario desconectado: ${socket.id}`);
            });
        });
    }

    /**
     * Envia una notificación a todos los clientes conectados.
     * @param message Mensaje de la notificación
     * @returns void
     * @emits 'notification' Evento enviado a todos los clientes
     * @example
     * notificationsGateway.sendToAll("Nuevo producto disponible");
     */
    public sendToAll(message: string) {
        const payload = { message, timestamp: new Date().toISOString() };
        // Emite a todos
        this.io.emit('notification', payload);
    }

    /**
     * Envia una notificación específica solo a administradores.
     * @param message Mensaje de la notificación
     * @returns void
     * @emits 'admin-notification' Evento enviado a todos los clientes admin
     * @example
     * notificationsGateway.sendToAdmins("Nueva orden pendiente de aprobación");
     */
    public sendToAdmins(message: string) {
        const payload = { message, timestamp: new Date().toISOString() };
        this.io.to('admins').emit('admin-notification', payload);
    }
}

export const notificationsGateway = new NotificationsGateway();
