# Backend Setup - ChapulinaApp

¡El backend de ChapulinaApp está completamente implementado! 🎉

## 📋 Tabla de Contenidos

1. [Resumen del Backend](#resumen-del-backend)
2. [Requisitos](#requisitos)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Cómo Usar](#cómo-usar)
5. [Estructura del Backend](#estructura-del-backend)
6. [API Endpoints](#api-endpoints)
7. [Próximos Pasos](#próximos-pasos)

---

## 🎯 Resumen del Backend

Se ha implementado un backend completo con las siguientes características:

### ✅ Características Implementadas

- **Autenticación JWT**: Sistema completo de login/registro con tokens
- **Autorización por roles**: Admin y Vendedor con permisos diferentes
- **CRUD Completo**: Productos, Categorías, Ventas y Configuración
- **Gestión de Stock**: Actualización automática de inventario al vender
- **Sistema de Talles**: Manejo de cantidades por talla (S, M, L, XL)
- **Soft Delete**: Eliminación lógica de registros
- **Validaciones**: Validación de datos con Mongoose
- **Manejo de Errores**: Middleware centralizado de errores
- **CORS**: Configurado para desarrollo local

### 🛠️ Tecnologías Utilizadas

- **Node.js + Express**: Framework del servidor
- **MongoDB + Mongoose**: Base de datos NoSQL
- **JWT**: Autenticación con tokens
- **bcryptjs**: Encriptación de contraseñas
- **dotenv**: Variables de entorno
- **CORS**: Comunicación frontend-backend

---

## 📦 Requisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
2. **MongoDB** (v5 o superior) - Opciones:
   - **MongoDB Community Edition** (local): [Descargar](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (cloud, gratis): [Crear cuenta](https://www.mongodb.com/cloud/atlas/register)

### Verificar instalación:

```bash
node --version
npm --version
mongod --version  # Si usas MongoDB local
```

---

## 🚀 Instalación y Configuración

### 1. Las dependencias ya están instaladas ✅

El backend ya tiene todas las dependencias instaladas. Si necesitas reinstalarlas:

```bash
cd server
npm install
```

### 2. Configurar MongoDB

**Opción A: MongoDB Local**

1. Instalar MongoDB Community Edition
2. Iniciar el servicio:
   ```bash
   # macOS (con Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   # MongoDB se inicia automáticamente como servicio
   ```

3. Verificar que está corriendo:
   ```bash
   mongosh  # o mongo en versiones antiguas
   ```

**Opción B: MongoDB Atlas (Cloud - Recomendado para empezar)**

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crear un cluster gratuito
3. Obtener la URI de conexión (algo como: `mongodb+srv://usuario:password@cluster.mongodb.net/chapulina_db`)
4. Agregar tu IP a la whitelist en Atlas

### 3. Configurar Variables de Entorno

El archivo `.env` ya está creado en `server/.env`. Verifica que contenga:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chapulina_db
JWT_SECRET=chapulina_secret_key_2025_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Si usas MongoDB Atlas**, cambia `MONGODB_URI` por tu URI de Atlas:
```env
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/chapulina_db
```

### 4. Poblar la Base de Datos (Seed)

Ejecutar el script de seed para crear datos de prueba:

```bash
cd server
npm run seed
```

Esto creará:
- 2 usuarios (admin y vendedora)
- 5 categorías
- 3 productos de ejemplo
- Configuración inicial

**Credenciales de acceso:**
- **Admin**: `admin@chapulina.com` / `admin123`
- **Vendedora**: `vendedora@chapulina.com` / `vendedora123`

---

## 🎮 Cómo Usar

### Iniciar el Backend

```bash
cd server
npm run dev
```

El servidor iniciará en: `http://localhost:5000`

Deberías ver:
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
```

### Probar la API

Puedes usar **Postman**, **Thunder Client** (extensión de VS Code), o **curl**:

```bash
# Verificar que el servidor está corriendo
curl http://localhost:5000/

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chapulina.com","password":"admin123"}'

# Obtener productos (requiere token)
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📁 Estructura del Backend

```
server/
├── src/
│   ├── config/
│   │   └── database.js              # Conexión a MongoDB
│   ├── controllers/                 # Lógica de negocio
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── saleController.js
│   │   └── settingsController.js
│   ├── middleware/                  # Middleware personalizado
│   │   ├── auth.js                  # JWT & autorización
│   │   └── errorHandler.js          # Manejo de errores
│   ├── models/                      # Esquemas de Mongoose
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   ├── Settings.js
│   │   └── User.js
│   ├── routes/                      # Rutas de la API
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── saleRoutes.js
│   │   └── settingsRoutes.js
│   ├── utils/
│   │   └── generateToken.js         # Generador de JWT
│   ├── seed.js                      # Script de datos iniciales
│   └── server.js                    # Punto de entrada
├── .env                             # Variables de entorno
├── .env.example                     # Ejemplo de variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🌐 API Endpoints

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar usuario | No |
| POST | `/login` | Login | No |
| GET | `/me` | Usuario actual | Sí |
| PUT | `/updatepassword` | Cambiar contraseña | Sí |

### Productos (`/api/products`)
| Método | Endpoint | Descripción | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Listar productos | Sí | Todos |
| GET | `/:id` | Ver producto | Sí | Todos |
| GET | `/low-stock` | Stock bajo | Sí | Todos |
| POST | `/` | Crear producto | Sí | Admin |
| PUT | `/:id` | Actualizar producto | Sí | Admin |
| DELETE | `/:id` | Eliminar producto | Sí | Admin |

### Categorías (`/api/categories`)
| Método | Endpoint | Descripción | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Listar categorías | Sí | Todos |
| GET | `/:id` | Ver categoría | Sí | Todos |
| POST | `/` | Crear categoría | Sí | Admin |
| PUT | `/:id` | Actualizar categoría | Sí | Admin |
| DELETE | `/:id` | Eliminar categoría | Sí | Admin |

### Ventas (`/api/sales`)
| Método | Endpoint | Descripción | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Listar ventas | Sí | Todos |
| GET | `/stats` | Estadísticas | Sí | Todos |
| GET | `/:id` | Ver venta | Sí | Todos |
| POST | `/` | Crear venta | Sí | Todos |
| PUT | `/:id` | Actualizar venta | Sí | Todos |
| DELETE | `/:id` | Eliminar venta | Sí | Admin |

### Configuración (`/api/settings`)
| Método | Endpoint | Descripción | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Ver configuración | Sí | Todos |
| PUT | `/` | Actualizar config | Sí | Admin |

---

## 🔜 Próximos Pasos

### Fase 1: Conectar el Frontend con el Backend

1. **Instalar axios en el frontend**:
   ```bash
   npm install axios
   ```

2. **Crear un servicio API** en el frontend para manejar las peticiones

3. **Implementar Context API** para:
   - Manejo de autenticación (login/logout)
   - Estado global del usuario
   - Token JWT

4. **Actualizar componentes** para usar datos del backend:
   - Login/Register
   - Products (CRUD con API)
   - Categories (CRUD con API)
   - Sales (CRUD con API)
   - Dashboard (obtener stats del backend)

### Fase 2: Mejoras Adicionales

- [ ] Implementar refresh tokens
- [ ] Agregar paginación en listados
- [ ] Implementar búsqueda avanzada
- [ ] Agregar reportes y gráficos
- [ ] Sistema de notificaciones
- [ ] Upload de imágenes (Cloudinary o AWS S3)
- [ ] Tests unitarios e integración
- [ ] Dockerizar la aplicación
- [ ] Deploy (Railway, Render, o Vercel)

---

## 🐛 Troubleshooting

### Error: "MongoDB connection failed"
- Verifica que MongoDB esté corriendo: `mongosh` o `mongo`
- Revisa la URI en `.env`
- Si usas Atlas, verifica que tu IP esté en la whitelist

### Error: "Port 5000 already in use"
- Cambia el puerto en `.env`: `PORT=5001`
- O mata el proceso: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

### Error: "Module not found"
- Reinstala dependencias: `cd server && npm install`

### Las dependencias no se instalan
- Borra node_modules y reinstala: `rm -rf node_modules package-lock.json && npm install`

---

## 📚 Recursos Útiles

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/) - Debugger de tokens
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Postman](https://www.postman.com/) - Para probar APIs

---

## ✅ Checklist de Verificación

Antes de continuar con el frontend, verifica que:

- [ ] MongoDB está instalado y corriendo
- [ ] El backend inicia sin errores (`npm run dev`)
- [ ] El seed se ejecutó correctamente (`npm run seed`)
- [ ] Puedes hacer login con las credenciales de prueba
- [ ] Los endpoints responden correctamente

---

**¿Listo para conectar el frontend?** 🚀

Una vez que verifiques que el backend funciona, podemos comenzar a integrar el frontend con la API.
