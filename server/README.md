# Chapulina Server API

Backend API para ChapulinaApp - Sistema de gestión de inventario y ventas.

## Tecnologías

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para encriptación de contraseñas

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Copiar `.env.example` a `.env` y configurar las variables:
```bash
cp .env.example .env
```

3. Asegurarse de tener MongoDB corriendo localmente o configurar una URI de MongoDB Atlas.

## Scripts

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en modo desarrollo con nodemon

## Endpoints API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Obtener usuario actual (requiere auth)
- `PUT /api/auth/updatepassword` - Actualizar contraseña (requiere auth)

### Productos
- `GET /api/products` - Obtener todos los productos (requiere auth)
- `GET /api/products/:id` - Obtener un producto (requiere auth)
- `POST /api/products` - Crear producto (requiere auth + admin)
- `PUT /api/products/:id` - Actualizar producto (requiere auth + admin)
- `DELETE /api/products/:id` - Eliminar producto (requiere auth + admin)
- `GET /api/products/low-stock` - Obtener productos con stock bajo (requiere auth)

### Categorías
- `GET /api/categories` - Obtener todas las categorías (requiere auth)
- `GET /api/categories/:id` - Obtener una categoría (requiere auth)
- `POST /api/categories` - Crear categoría (requiere auth + admin)
- `PUT /api/categories/:id` - Actualizar categoría (requiere auth + admin)
- `DELETE /api/categories/:id` - Eliminar categoría (requiere auth + admin)

### Ventas
- `GET /api/sales` - Obtener todas las ventas (requiere auth)
- `GET /api/sales/:id` - Obtener una venta (requiere auth)
- `POST /api/sales` - Crear venta (requiere auth)
- `PUT /api/sales/:id` - Actualizar venta (requiere auth)
- `DELETE /api/sales/:id` - Eliminar venta (requiere auth + admin)
- `GET /api/sales/stats` - Obtener estadísticas de ventas (requiere auth)

### Configuración
- `GET /api/settings` - Obtener configuración (requiere auth)
- `PUT /api/settings` - Actualizar configuración (requiere auth + admin)

## Estructura del Proyecto

```
server/
├── src/
│   ├── config/
│   │   └── database.js       # Configuración de MongoDB
│   ├── controllers/          # Controladores de rutas
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── saleController.js
│   │   └── settingsController.js
│   ├── middleware/           # Middleware personalizado
│   │   ├── auth.js          # Autenticación y autorización
│   │   └── errorHandler.js  # Manejo de errores
│   ├── models/              # Modelos de Mongoose
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   ├── Settings.js
│   │   └── User.js
│   ├── routes/              # Rutas de la API
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── saleRoutes.js
│   │   └── settingsRoutes.js
│   ├── utils/               # Utilidades
│   │   └── generateToken.js
│   └── server.js            # Punto de entrada
├── .env.example             # Variables de entorno de ejemplo
├── .gitignore
├── package.json
└── README.md
```

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación.

Para acceder a rutas protegidas, incluir el token en el header:
```
Authorization: Bearer <token>
```

## Roles

- `admin` - Acceso completo
- `vendedor` - Acceso limitado (no puede crear/editar/eliminar productos y categorías)

## Notas

- Todas las eliminaciones son "soft deletes" (se marca como inactivo)
- Los precios están en la moneda local
- El sistema maneja stock por talla
- Las ventas actualizan automáticamente el stock
