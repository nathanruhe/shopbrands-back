# Shop Backend API
Documentación de la API basada en la especificación `openapi.yam`. 
> Contiene los endpoints disponibles, esquemas y ejemplos de request/response para autenticación, usuarios, direcciones, productos, carrito, pedidos, pagos (Stripe), facturas (PDF), dashboard administrativo y notificaciones en tiempo real.

<br>
<br>

## Servidores
- Local: http://localhost:3000

<br>
<br>

## Convenciones
- Autenticación: Bearer JWT (cabecera `Authorization: Bearer <token>`).
- Fechas: ISO 8601 (`format: date-time`) para `created_at` / `updated_at`.
- Creación de recursos: normalmente **201 Created.**
- Rutas con parámetros de path usan {id} (ej.: `/orders/{id}`).
- Errores devuelven un objeto `ErrorResponse` con `{ message: string }` como mínimo.

<br>
<br>

## Índice de Endpoints
|     Categoría     | Método |       Ruta                 |                Descripción / acceso                 |
|:-----------------:|:------:|:--------------------------:|-----------------------------------------------------|
| **Auth**	        | POST	 | /auth/register	          | Registrar nuevo usuario                             |
| **Auth**	        | POST	 | /auth/login	              | Iniciar sesión                                      |
| **Auth**	        | PUT	 | /auth/change-password	  | Cambiar contraseña (autenticado)                    |
| **Auth**	        | POST	 | /auth/forgot-password	  | Solicitar recuperación de contraseña                |
| **Auth**	        | POST	 | /auth/reset-password	      | Restablecer contraseña mediante token               |
| **Users**	        | GET	 | /users	                  | Listar usuarios (admin)                             |
| **Users**	        | GET	 | /users/me	              | Obtener perfil del usuario (autenticado)            |
| **Users**	        | PUT	 | /users/me	              | Actualizar perfil del usuario (autenticado)         |
| **Users**	        | DELETE | /users/me	              | Eliminar cuenta propia (autenticado)                |
| **Users**	        | GET	 | /users/{id}	              | Obtener usuario por ID (admin)                      |
| **Users**	        | PUT	 | /users/{id}	              | Actualizar usuario por ID (admin)                   |
| **Users**	        | DELETE | /users/{id}	              | Eliminar usuario por ID (admin)                     |
| **Addresses**	    | POST	 | /addresses	              | Crear dirección (autenticado)                       |
| **Addresses**	    | GET	 | /addresses	              | Listar direcciones del usuario (autenticado)        |
| **Addresses**	    | PUT	 | /addresses/{id}	          | Actualizar dirección (autenticado)                  |
| **Addresses**	    | DELETE | /addresses/{id}	          | Eliminar dirección (autenticado)                    |
| **Products**	    | GET	 | /products	              | Listar productos (filtros y paginación opcionales)  |
| **Products**	    | GET	 | /products/{id}	          | Obtener detalle de producto                         |
| **Products**	    | POST	 | /products	              | Crear producto (admin — multipart/form-data)        |
| **Products**	    | PUT	 | /products/{id}	          | Actualizar producto (admin — multipart opcional)    |
| **Products**	    | DELETE | /products/{id}	          | Eliminar producto (admin)                           |
| **Cart**	        | GET	 | /cart	                  | Obtener carrito del usuario (autenticado)           |
| **Cart**	        | DELETE | /cart	                  | Vaciar carrito del usuario (autenticado)            |
| **Cart**	        | POST	 | /cart/items	              | Añadir item al carrito (autenticado)                |
| **Cart**	        | PUT	 | /cart/items/{id}	          | Actualizar items del carrito (autenticado)          |
| **Cart**	        | DELETE | /cart/items/{id}	          | Eliminar item del carrito (autenticado)             |
| **Cart**	        | POST	 | /cart/checkout	          | Crea orden + sesión de Stripe (autenticado)         |
| **Orders**	    | POST	 | /orders	                  | Crear pedido (autenticado)                          |
| **Orders**	    | GET	 | /orders/me	              | Obtener pedidos del usuario (autenticado)           |
| **Orders**	    | GET	 | /orders/{id}	              | Obtener pedido por ID (autenticado / admin)         |
| **Orders**	    | GET	 | /orders	                  | Listar todos los pedidos (admin)                    |
| **Orders**	    | PUT	 | /orders/{id}/status	      | Actualizar estado de pedido (admin)                 |
| **Orders**	    | DELETE | /orders/{id}	              | Eliminar pedido (admin)                             |
| **Invoice**	    | GET	 | /orders/invoice/{id}	      | Generar/descargar factura en PDF (autenticado)      |
| **Payments**	    | POST	 | /payments/checkout-session | Crear sesión Stripe Checkout                        |
| **Payments**	    | POST	 | /payments/webhook	      | Webhook Stripe (express.raw + stripe-signature)     |
| **Dashboard**	    | GET	 | /dashboard/*	              | Endpoints administrativos (admin)                   |
| **Notifications**	| POST	 | /notifications	          | Emitir notificación a todos los usuarios conectados |
| **Notifications**	| POST	 | /notifications/admin	      | Emitir notificación solo a admins conectados        |

>Las notificaciones no se persisten en base de datos en la implementación actual; se emiten a través de WebSocket (socket.io).

<br>
<br>

## Auth
### POST /auth/register → Registrar nuevo usuario.
- Auth: No.

Request Body:
```json
{
    "first_name": "Jonathan",
    "last_name": "Doe",
    "email": "jonathan@example.com",
    "password": "contraseñaSegura123",
    "role": "customer", // 'customer' o 'admin'
    "phone": "666222111"
}
```
Responses
```json
201 Created — { "message": "Usuario registrado correctamente" }
```
```json
400 Bad Request — ErrorResponse
```

### POST /auth/login → Autenticar usuario y devolver JWT y datos públicos.
- Auth: No.

Request Body:
```json
{
    "email": "maria@example.com",
    "password": "contraseñaSegura123"
}
```
Responses
```json
200 OK
{
    "token": "<jwt>",
    "user": {
        "id": 101,
        "first_name": "María",
        "last_name": "Pérez",
        "email": "maria@example.com",
        "role": "customer",
        "phone": "666222111",
        "created_at": "...",
        "updated_at": "..."
    }
}
```
```json 
400 / 401 — ErrorResponse
```

### PUT /auth/change-password → Cambiar contraseña usuario autenticado.
- Auth: Sí (Bearer).

Request Body:
```json
{
    "current_password": "antigua123",
    "new_password": "nuevaSegura456"
}
```
Responses
```json
200 OK — { "message": "Contraseña actualizada correctamente" }
```
```json 
400 / 401 — { "message": "Contraseña actual incorrecta" }
```

### POST /auth/forgot-password → Solicitar recuperación de contraseña
- Auth: No.

Request Body:
```json
{
  "email": "usuario@example.com"
}
```
Responses
```json
200 OK — { "message": "Hemos enviado un correo con las instrucciones para restablecer tu contraseña." }
```
```json 
400 — { "message": "No existe una cuenta registrada con este correo" }
```

### POST /auth/reset-password → Restablecer contraseña mediante token
- Auth: No.

Request Body:
```json
{
  "token": "d0f2e3c4b5...",
  "new_password": "contraseñaNueva123"
}
```
Responses
```json
200 OK — { "message": "Contraseña restablecida correctamente" }
```
```json 
400 — { "message": "Token inválido o expirado" }
```

<br>
<br>

## Users
### GET /users/me → Obtener perfil del usuario autenticado.
- Auth: Sí (Bearer).

Responses
```json
200 OK — UserPublic objeto.
```

### PUT /users/me → Actualizar perfil del usuario autenticado.
- Auth: Sí.
- Body: UserUpdateRequest (campos opcionales).

Responses
```json
200 OK — UserPublic
```
```json
400 Bad Request — ErrorResponse
```

### DELETE /users/me → Eliminar cuenta del usuario autenticado.
- Auth: Sí.

Responses
```json
200 OK — UserDeleteResponse
```
```json
401 / 403 / 400 Bad Request — ErrorResponse
```

### GET /users/{id} → Obtener detalles de un usuario por ID (admin).
- Auth: Sí (admin).
- Parameters: id (path, integer).

Responses
```json
200 OK — User
```
```json
404 Not Found — ErrorResponse
```

### PUT /users/{id} → Actualizar usuario por ID (admin).
- Auth: Sí (admin).
- Body: UserUpdateRequest.

Responses
```json
200 OK — User
```
```json
400 — ErrorResponse
```

### DELETE /users/{id} → Eliminar usuario por ID (admin).
- Auth: Sí (admin).

Responses
```json
200 / 204 — eliminación confirmada
```
```json
404 — ErrorResponse
```

<br>
<br>

## Addresses
### POST /addresses → Crear dirección asociada al usuario autenticado.
- Auth: Sí.
- Body (AddressCreateRequest) — campos requeridos: first_name, last_name, street, city, province, postal_code, country. phone y type opcionales.

Responses
```json
201 Created — { message: "Dirección añadida correctamente" }
```
```json
400 Bad Request — ErrorResponse
```

### GET /addresses → Listar direcciones del usuario (autenticado).
- Auth: Sí.

Responses
```json
200 OK — Address[]
```

### PUT /addresses/{id} → Actualizar una dirección (autenticado).
- Auth: Sí.
- Body: AddressUpdateRequest.

Responses
```json
200 OK — { message: "Dirección actualizada correctamente" }
```
```json
400 / 404 — ErrorResponse
```

### DELETE /addresses/{id} → Eliminar una dirección (autenticado).
- Auth: Sí.

Responses
```json
200 OK — { message: "Dirección eliminada correctamente" }
```
```json
400 / 404 — ErrorResponse
```

<br>
<br>

## Products
### GET /products → Listado de productos con filtros y paginación.
Query Parameters:
- category (string, opcional) — ejemplo: ?categories=1,2
- limit (integer, opcional) — ejemplo: ?limit=10
- offset (integer, opcional) — ejemplo: ?offset=20

Responses
```json
200 OK — Product[]
```

### GET /products/{id} → Detalle de producto.
Responses
```json
200 OK — Product
```
```json
400/404 — ErrorResponse
```

### POST /products → Crear producto (admin). multipart/form-data para imagen.
- Auth: Sí (admin).
- Body: ProductCreateRequest (name, price obligatorios).

Responses
```json
201 Created — { message: "Producto creado correctamente", id: <productId> }
```
```json
400 / 403 — ErrorResponse
```

### PUT /products/{id} → Actualizar producto (admin). Acepta application/json o multipart/form-data si se cambia imagen.
- Auth: Sí (admin).

Responses
```json
200 OK — Product
```
```json
400 / 403 — ErrorResponse
```

### DELETE /products/{id} → Eliminar producto (admin).
- Auth: Sí (admin).

Responses
```json
200 OK — { message: "Producto eliminado correctamente" }
```
```json
400 / 403 — ErrorResponse
```

<br>
<br>

## Cart
### GET /cart → Obtener el carrito del usuario autenticado.
- Auth: Sí.

Responses
```json
200 OK — CartResponse (cart_id, user_id, items[], total)
```

### DELETE /cart → Vaciar completamente el carrito del usuario autenticado.
- Auth: Sí.

Responses
```json
200 OK — { message: "Carrito eliminado correctamente" }
```

### POST /cart/items → Agregar producto al carrito.
- Auth: Sí.

Request Body:
```json
{
  "product_id": 15,
  "quantity": 2
}
```
Responses
```json
200 OK — CartResponse
```
```json
400 — ErrorResponse
```

### PUT /cart/items/{id} → Actualizar cantidad de un producto del carrito.
- Auth: Sí.

Request Body:
```json
{ "quantity": 3 }
```
Responses
```json
200 OK — CartResponse
```
```json
400 — ErrorResponse
```

### DELETE /cart/items/{id} → Eliminar producto del carrito.
- Auth: Sí.

Responses
```json
200 OK — CartResponse
```
```json
400 — ErrorResponse
```

### POST /cart/checkout → Iniciar checkout: crea orden y genera sesión de Stripe Checkout.
- Auth: Sí.

Request Body:
```json
{
  "address_id": 4,
  "frontendUrl": "https://miapp.com"
}
```
Responses
```json
200 OK — { "orderId": 123, "url": "https://checkout.stripe.com/session/..." }
```
```json
400 / 500 — ErrorResponse
```

<br>
<br>

## Orders
>El user_id se obtiene del JWT en el backend; no enviar user_id en el body.

### POST /orders → Crear un pedido con items asociados.
- Auth: Sí.

Request Body (CreateOrderRequest):
```json
{
    "user_id": 2,
    "address_id": 1,
    "items": [
        { "product_id": 27, "quantity": 2, "price": 50.00 },
        { "product_id": 15, "quantity": 1, "price": 30.00 }
    ],
    "total": 130.00
}
```
Responses
```json
201 Created — { "message": "Pedido creado correctamente", "orderId": 184 }
```
```json
400 Bad Request — ErrorResponse
```

### GET /orders/me → Obtener todos los pedidos del usuario autenticado.
- Auth: Sí.

Responses
```json
200 OK — Order[] (items y dirección incluidos)
```
### GET /orders/{id} → Obtener un pedido por ID. (autenticado o admin)
- Auth: Sí.

Responses
```json
200 OK — Order
```
```json
400/404 — ErrorResponse
```

### GET /orders → Obtener todos los pedidos (admin)
- Auth: Sí (admin).

Responses
```json
200 OK — array de orders (raw)
```

### PUT /orders/{id}/status → Actualizar estado del pedido (admin). Si el estado es returned, se procesan reembolsos en Stripe, se actualizan pagos y se notifica al cliente.
- Auth: Sí (admin).

Request Body:
```json
{ "status": "processing" }
```
Responses
```json
200 OK — { "message": "Estado del pedido actualizado" }
```
```json
400 / 500 — ErrorResponse
```

### DELETE /orders/{id} → Eliminar un pedido (admin).
- Auth: Sí (admin).

Responses
```json
200 OK — { "message": "Pedido eliminado correctamente" }
```
```json
400 — ErrorResponse
```

### POST /orders/{id}/return → Solicitar devolución (usuario).
- Auth: Sí.
- Solo pedidos con estado shipped o completed.

Request Body:
```json
{ "reason": "Motivo de la devolución" }
```
Responses
```json
201 Created
{ 
    "message": "Devolución solicitada correctamente, pendiente de aprobación", 
    "returnId": <id> 
}
```
```json
400 / 404 — ErrorResponse
```

### GET /orders/me/returns → Obtener todas las devoluciones del usuario autenticado.
- Auth: Sí.

Responses
```json
200 OK — array de Return
```

### PUT /orders/returns/{id}/status → Actualizar estado de una devolución (admin). 
- Auth: Sí (admin).
- Status puede ser approved o rejected. 
- Approved, actualiza el pedido a awaiting_return y envía email.
- Rejected, solo envía email. 

Request Body:
```json
{ "status": "approved" }
```
Responses
```json
200 OK — { "message": "Devolución approved correctamente" }
```
```json
400 / 404 — ErrorResponse
```

<br>
<br>

## Invoice
### GET /orders/invoice/{id} → Genera la factura en PDF del pedido. 
- Auth: Sí.
- Renderiza template EJS y convierte a PDF con Puppeteer.

Responses
```json
200 — application/pdf (Content-Disposition: inline; filename=factura_{id}.pdf)
```
```json
400 / 404 — ErrorResponse
```

Detalles técnicos
- Puppeteer se ejecuta en modo headless con flags --no-sandbox, --disable-setuid-sandbox.
- El HTML se genera a partir de plantilla EJS con BASE_URL como variable de entorno opcional.

<br>
<br>

## Payments
### POST /payments/checkout-session → Crear sesión de Stripe Checkout asociada a un pedido. Devuelve URL de redirección a Stripe.
- Auth: Según implementación
- Request Body (CreateCheckoutRequest):
```json
{
  "orderId": 301,
  "frontendUrl": "https://mi-tienda.com"
}
```
Responses
```json
200 OK — { "url": "https://checkout.stripe.com/c/pay/..." }
```
```json
400 / 404 / 500 — ErrorResponse
```

### POST /payments/webhook → Endpoint para recibir eventos de Stripe 
- Headers: stripe-signature (obligatorio).
- Body: Evento enviado por Stripe (raw JSON).
- (Ejemplo: `checkout.session.completed`). Debe recibir raw body para validar firma.

Comportamiento implementado
- Validación de firma: `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`.
- En `checkout.session.completed`:
    - Recupera `orderId` desde `session.metadata.orderId`.
    - Calcula `totalPaid` (de céntimos a euros).
    - Extrae `discountAmount` y `promotionCode` cuando están presentes.
    - Actualiza `orders.status` a `completed`.
    - Inserta registro en ``payments` con `status = "completed"`.
    - Actualiza `orders.total_paid`, `orders.discount_amount`, `orders.promotion_code`.
    - Elimina carrito asociado al usuario.
    - Genera factura (InvoiceService) y envía correo de confirmación.
    - Notifica al admin en tiempo real (`notifyAdminPaymentReceived`).

Responses
```json
200 OK — { "received": true } si se procesa correctamente.
```
```json
400 / 500 — ErrorResponse
```

<br>
<br>

## Dashboard (admin)
>Acceso: Autenticación + rol `admin`. Rutas agrupadas bajo `/dashboard`.

### GET /dashboard/overview
Responses: `{ "total_sales": 12345.67, "total_orders": 321, "avg_order_value": 38.45, "total_users": 1024 }`

### GET /dashboard/orders-by-status
Responses: `[{ "status": "pending", "count": 10 }, ...]`

### GET /dashboard/recent-orders?limit=
Responses: `RecentOrder[] (campos: id, user_id, total, status, created_at, first_name, last_name, email, street, city, province)`

### GET /dashboard/top-products?limit=
Responses: `TopProduct[] (product_id, product_name, image_url, total_quantity, total_revenue)`

### GET /dashboard/sales-by-day?days=
Responses: `SalesByDay[] (day YYYY-MM-DD, total_sales, orders_count)`

### GET /dashboard/sales-by-month?months=
Responses: `SalesByMonth[] (month YYYY-MM, total_sales, orders_count)`

### GET /dashboard/users-by-day?days=
Responses: `UsersByDay[] (day YYYY-MM-DD, users_count)`

### GET /dashboard/orders?status=&start=&end=&userId=
Responses: `FilteredOrder[]`

### GET /dashboard/users?limit=
Responses: `User[]`

### GET /dashboard/filters
Responses: `FilterOptions { statuses: string[], payment_methods: string[] }`

### GET /dashboard/returns-summary
Responses: `{ pending, approved, rejected, total_amount_returned }`

### GET /dashboard/returns
Responses: `lista con todas las devoluciones (incluye detalles del usuario y estado del pedido)`

<br>
<br>

## Notifications (real-time)
>Funciones para emitir notificaciones en tiempo real vía socket.io. No hay persistencia por defecto; los endpoints HTTP disparan los eventos.

### POST /notifications → Emitir notificación a todos los usuarios conectados.
- Auth: Sí (Bearer).

Request Body:
```json
{ "message": "Nuevo producto disponible" }
```
Responses
```json
200 OK — { "message": "Notificación enviada a usuarios" }
```
- Evento emitido por socket.io: `notification`
- Payload: `{ "message": string, "timestamp": ISODate }`

### POST /notifications/admin → Emitir notificación solo a administradores conectados.
- Auth: Sí (admin).
Request Body:
```json
{ "message": "Nuevo pedido #123" }
```
Responses
```json
200 OK — { "message": "Notificación enviada a admins" }
```
- Evento emitido por socket.io: `admin-notification`
- Payload: `{ "message": string, "timestamp": ISODate }`

<br>
<br>

## Esquemas principales (resumen)
- AuthRegisterRequest
    - first_name, last_name, email, password, role?, phone?
- AuthLoginRequest
    - email, password
- AuthLoginResponse
    - token, user (UserPublic)
- UserPublic / User
    - id, first_name, last_name, email, role, phone, created_at, updated_at
- Address / AddressCreateRequest / AddressUpdateRequest
    - id, first_name, last_name, street, city, province, postal_code, country, phone, type, created_at, updated_at
- Product / ProductCreateRequest / ProductUpdateRequest
    - id, name, description, image_url, price, stock, size, color, sku, categories[], created_at, updated_at
- CartResponse / CartItem
    - cart_id, items[] (CartItem: id, product_id, product_name, price, quantity, subtotal), total
- CreateOrderRequest / Order / OrderItem
    - address_id, items[] { product_id, quantity, price }, total
    - Order: id, user_id, status, status_label, total, total_paid, discount_amount, promotion_code, address, items[], created_at, updated_at
- RequestReturn / Return
    - reason, total_amount, status, order_status, timestamps
- CreateCheckoutRequest / CreateCheckoutResponse
    - orderId, frontendUrl → { url }
- PaymentRecord
    - id, order_id, transaction_id, amount, status, method, discount_amount, promotion_code, created_at
- Dashboard (varios)*
    - DashboardOverview, OrdersByStatus, RecentOrder, TopProduct, SalesByDay, SalesByMonth, UsersByDay, FilteredOrder, FilterOptions, ReturnsSummary
- NotificationMessage / NotificationResponse
    - message → confirmation object { message: string }

<br>
<br>

## Códigos de error comunes
- `400` — Bad Request / Validación
- `401` — Unauthorized (JWT faltante/incorrecto)
- `403` — Forbidden (rol insuficiente)
- `404` — Not Found
- `500` — Error interno

<br>
<br>

## Notas técnicas (especificaciones de funcionamiento)

- **Stripe Webhook:** el endpoint `/payments/webhook` debe recibir raw body (no parseado) para validar la firma enviada en la cabecera stripe-signature. En la implementación se utiliza `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` para validación. El procesamiento contempla `checkout.session.completed`, inserción de `payments`, actualización de `orders`, y generación de factura + envío de email.

- **Puppeteer (Invoice):** la generación de PDF se realiza con Puppeteer en modo headless y con argumentos `--no-sandbox` y `--disable-setuid-sandbox`. El HTML de la factura se renderiza con una plantilla EJS y se convierte a PDF ajustando la altura del body para evitar saltos.

- **Totales y descuentos:** cuando en base de datos total coincide con `total_paid` y existe `discount_amount`, el servicio reconstruye el originalTotal mediante `originalTotal = total_paid` + `discount_amount` para mostrar el total original antes del descuento.

- **Notificaciones (socket.io):** el gateway inicializa un `Server` de socket.io con CORS abierto (`origin: '*'`) y emite eventos `notification` y `admin-notification` con payload { `message, timestamp` }.

<br>
<br>

## Esquema de la base de datos (resumen de tablas relevantes)
- `users`: id, first_name, last_name, email, password_hash, role, phone, created_at, updated_at

- `addresses`: id, user_id, first_name, last_name, street, city, province, postal_code, country, phone, type, created_at

- `products`: id, name, description, image_url, price, stock, size, color, sku, created_at

- `order_items`: id, order_id, product_id, quantity, price

- `orders`: id, user_id, address_id, status, total, total_paid, discount_amount, promotion_code, created_at, updated_at

- `payments`: id, order_id, method, status, transaction_id, amount, discount_amount, promotion_code, created_at

- `cart / cart_items`: cart.id (user_id), cart_items: cart_id, product_id, quantity

- `returns`: id, order_id, user_id, reason, total_amount, status, created_at, updated_at

### Observaciones de consistencia funcional
- El `user_id` de un pedido se asigna en backend a partir del JWT (`req.user!.id`); no se debe incluir `user_id` en el cuerpo de creación de pedidos.

- Rutas administrativas están protegidas con `authorize('admin')` (según `openapi.yaml` y la implementación).

- Las notificaciones son emitidas en tiempo real y no se almacenan en la base de datos en la implementación actual.

<br>
<br>

## Ejemplos rápidos

### Crear pedido
#### POST /orders
- Authorization: `Bearer <token>`

Request Body:
```json 
{
  "address_id": 4,
  "items": [
    { "product_id": 10, "quantity": 2, "price": 19.99 }
  ],
  "total": 39.98
}
```
Responses
```json 
201 Created
{
  "message": "Pedido creado correctamente",
  "orderId": 123
}
```

### Crear sesión Stripe
#### POST /payments/checkout-session

Request Body:
```json 
{
  "orderId": 123,
  "frontendUrl": "https://mi-tienda.com"
}
```
Responses
```json 
200 OK
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123xyz"
}
```

<br>
<br>

### Webhook Stripe
- Header: ``stripe-signature: <signature>``
- Body: raw JSON del evento enviado por Stripe
- Respuesta esperada tras procesamiento: ``200 OK { "received": true }``