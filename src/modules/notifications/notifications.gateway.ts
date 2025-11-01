import { Server, Socket } from 'socket.io';

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

        this.io.on('connection', (socket: Socket) => {
            console.log(`🔔 Usuario conectado: ${socket.id}`);

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
        this.io.emit('notification', { message, timestamp: new Date() });
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
        this.io.emit('admin-notification', { message, timestamp: new Date() });
    }
}

export const notificationsGateway = new NotificationsGateway();
