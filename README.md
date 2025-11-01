# 🛍️ ShopBrands Backend
Backend del proyecto **ShopBrands**, una tienda online completa desarrollada con **Node.js**, **Express**, **TypeScript** y **MySQL**.  
Forma parte del ecosistema completo *ShopBrands* (Frontend + Backend), que incluye autenticación, gestión de productos, pedidos, carrito, pagos en línea y notificaciones en tiempo real.

<br><br>

## 🚀 Tecnologías principales
- **Node.js + Express** → Framework del servidor  
- **TypeScript** → Tipado estático y desarrollo escalable  
- **MySQL** → Base de datos relacional  
- **JWT** → Autenticación segura basada en tokens  
- **Swagger (OpenAPI)** → Documentación interactiva de la API  
- **Nodemailer** → Envío de correos de confirmación y notificaciones  
- **Stripe** → Procesamiento de pagos online  
- **Socket.IO** → Notificaciones en tiempo real para usuarios y administradores  

<br><br>

## 📁 Estructura del proyecto
```bash
shop-backend/
├── src/
│ ├── server.ts → Punto de entrada principal
│ ├── app.ts → Configuración del servidor Express
│ │
│ ├── config/ → Variables de entorno y conexión DB
│ ├── database/ → Conexión y queries MySQL
│ ├── modules/ → Módulos principales (auth, users, products, orders, etc.)
│ ├── integrations/ → Stripe, Mail, plantillas EJS
│ ├── middlewares/ → Autenticación, roles y manejo de errores
│ ├── utils/ → Funciones auxiliares (JWT, notificaciones, mapeos)
│ └── routes.ts → Registro de rutas globales
│
├── docs/
│ ├── openapi.yaml → Especificación completa (Swagger/OpenAPI)
│ └── API.md → Documentación técnica y manual de endpoints
│
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
└── LICENSE
```

<br><br>

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/nathanruhe/shopbrands-back.git
cd shopbrands-back
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno
Copia el archivo de ejemplo y crea tu .env:
```bash
cp .env.example .env
```
Edita las variables necesarias:
```bash
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=shopbrands_db
JWT_SECRET=clave_super_segura
STRIPE_SECRET_KEY=tu_clave_stripe
```

### 4️⃣ Compilar y ejecutar el servidor
Modo desarrollo (con recarga automática):
```bash
npm run dev
```
Modo producción:
```bash
npm run build
npm start
```
El servidor se ejecutará en http://localhost:3000

<br><br>

## 📘 Documentación de la API
### Swagger UI (interactivo)
Una vez iniciado el servidor, accede a:
```bash
http://localhost:3000/api-docs
```
Desde ahí puedes probar todos los endpoints directamente desde el navegador.

### Documentación manual
Consulta el archivo:
```bash
./docs/API.md
```
Contiene ejemplos completos de request y response en formato JSON, modelos de datos y descripciones detalladas.

<br><br>

## 🧠 Endpoints principales
|     Categoría     | Método |       Ruta             |                Descripción                |
|:-----------------:|:------:|:----------------------:|:-----------------------------------------:|
| **Auth**          | POST   | `/auth/register`       | Registrar un nuevo usuario                |
| **Auth**          | POST   | `/auth/login`          | Iniciar sesión y obtener token JWT        |
| **Users**         | GET    | `/users`               | Obtener todos los usuarios (admin)        |
| **Users**         | GET    | `/users/{id}`          | Obtener detalle de un usuario             |
| **Products**      | GET    | `/products`            | Listar productos con filtros y paginación |
| **Products**      | GET    | `/products/{id}`       | Obtener detalle de un product             |
| **Products**      | POST   | `/products`            | Crear un producto (admin)                 |
| **Cart**          | GET    | `/cart/items`          | Obtener productos del carrito del usuario |
| **Cart**          | POST   | `/cart/items`          | Agregar producto al carrito               |
| **Cart**          | DELETE | `/cart/items/{id}`     | Eliminar producto del carrito             |
| **Orders**        | POST   | `/orders`              | Crear pedido y generar factura            |
| **Orders**        | GET    | `/orders`              | Obtener pedidos del usuario               |
| **Payments**      | POST   | `/payments`            | Procesar pago de un pedido con Stripe     |
| **Notifications** | POST   | `/notifications`       | Enviar notificación a usuarios conectados |
| **Notifications** | POST   | `/notifications/admin` | Enviar notificación al admin              |
| **Dashboard**     | GET    | `/dashboard/overview`  | Métricas y estadísticas generales (admin) |

<br><br>

## 🧩 Scripts disponibles
|     Comando     |                 Descripción                 |
|:---------------:|:-------------------------------------------:|
| `npm run dev`   | Inicia el servidor con nodemon              |
| `npm run build` | Compila TypeScript a JavaScript (dist/)     |
| `npm start`     | Ejecuta el servidor en modo producción      |
| `npm test`      | Ejecuta los tests (unitarios e integración) |

<br><br>

## 🧪 Testing
Estructura base preparada para pruebas con Jest y Supertest:
```bash
/testing/
    ├── unit/
    ├── integration/
    └── e2e/
```
Permite testear endpoints, controladores y servicios individualmente.

<br><br>

## 📦 Base de datos
- Motor: MySQL
- Gestión mediante mysql2 y un pool de conexiones.
- Consultas modulares en:
```bash
src/database/queries/
```
Cada módulo (users, orders, products, payments, etc.) tiene su propio archivo de queries.
Se puede visualizar y administrar con **MySQL Workbench**.

<br><br>

## 🔔 Notificaciones en tiempo real
El sistema utiliza **Socket.IO** para notificaciones instantáneas:
- Cuando un usuario realiza un pedido, el administrador conectado recibe una notificación.
- Cuando un administrador agrega un nuevo producto, los usuarios conectados reciben la alerta.
- Las notificaciones no se almacenan en base de datos; se emiten en tiempo real.

Eventos:
- `notification`: Mensajes para todos los usuarios.
- `admin-notification`: Mensajes solo para administradores.

<br><br>

## 📤 Correos automáticos
Se envían mediante **Nodemailer** con plantillas EJS personalizadas:
- Confirmación de pedido con factura adjunta.
- Estado de devoluciones (aprobada, completada, rechazada).
- Notificaciones administrativas.

<br><br>

## 💳 Pagos con Stripe
Integración completa con la API de **Stripe**:
- Creación de pagos desde el cliente.
- Webhook para confirmar pagos exitosos.
- Registro automático del estado del pedido.

<br><br>

## 🧠 Facturas en PDF
- Generadas con **Puppeteer** a partir de plantillas HTML/EJS.
- Cada pedido confirmado genera una factura descargable o enviada por correo.

<br><br>

## 🔒 Seguridad
- Tokens **JWT** con expiración configurable.
- Middleware de autenticación `auth.middleware.ts`.
- Roles y permisos con `authorize('admin')`.
- Validación y sanitización de inputs.
- CORS habilitado con control de orígenes seguros.

<br><br>

## 📦 Dependencias principales
Dependencias
```bash
{
  "express": "^5.1.0",
  "mysql2": "^3.15.2",
  "dotenv": "^17.2.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^3.0.2",
  "socket.io": "^4.8.1",
  "stripe": "^19.1.0",
  "nodemailer": "^7.0.9",
  "ejs": "^3.1.10",
  "puppeteer": "^24.25.0",
  "cors": "^2.8.5",
  "swagger-ui-express": "^5.0.1",
  "js-yaml": "^4.1.0",
  "pdfkit": "^0.17.2",
  "multer": "^2.0.2"
}
```
Dependencias de desarrollo
```bash
{
  "typescript": "^5.9.3",
  "@types/node": "^24.8.0",
  "@types/express": "^5.0.3",
  "@types/jsonwebtoken": "^9.0.10",
  "@types/cors": "^2.8.19",
  "@types/socket.io": "^3.0.1",
  "nodemon": "^3.1.10",
  "ts-node": "^10.9.2",
  "typedoc": "^0.28.14",
  "jsdoc": "^4.0.5"
}
```

<br><br>

## 📤 Deploy
Opción 1: Docker (en desarrollo)
- Configuración de contenedor pendiente con `Dockerfile` y `docker-compose.yml`.

Opción 2: Manual
1. Ejecuta `npm run build`
2. Sube la carpeta `/dist` al servidor Node.
3. Configura las variables de entorno en el sistema de producción.

<br><br>

## 👨‍💻 Autor
**Nathanruhe** — *Desarrollador Web Full Stack*

[📧 Correo](mailto:nathan.ruhe@hotmail.com) • 
[💼 LinkedIn](https://www.linkedin.com/in/nathanruhe/) • 
[🐙 GitHub](https://github.com/nathanruhe)

<br><br>

## 📜 Licencia
Este proyecto está bajo la licencia MIT — libre para uso y modificación, siempre que se cite al autor original.

<br><br>

👉 [Ver documentación completa de la API](./docs/API.md)