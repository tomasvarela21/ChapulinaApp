# Guía de Despliegue del Backend en Vercel

## Prerequisitos

- Cuenta en Vercel (conectada con GitHub)
- MongoDB Atlas configurado (ya lo tienes)
- Código subido a GitHub

## Paso 1: Configurar MongoDB Atlas para Producción

### 1.1 Permitir Acceso desde Vercel

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu cluster **"chapulinadb"**
4. En el menú lateral, haz clic en **"Network Access"**
5. Haz clic en **"Add IP Address"**
6. Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Esto es necesario porque Vercel usa IPs dinámicas
7. Haz clic en **"Confirm"**

⚠️ **Importante**: Esto es seguro porque MongoDB usa autenticación con usuario/contraseña.

### 1.2 Verificar tu Connection String

Tu MongoDB URI ya está configurado:
```
mongodb+srv://tomasvarelaa19_db_user:mojito2142@chapulinadb.z8uch4v.mongodb.net/?appName=chapulinadb
```

Asegúrate de agregar el nombre de la base de datos al final:
```
mongodb+srv://tomasvarelaa19_db_user:mojito2142@chapulinadb.z8uch4v.mongodb.net/chapulina?appName=chapulinadb
```

## Paso 2: Generar JWT Secret Seguro

Genera una clave segura para producción:

```bash
# Opción 1: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Usando una herramienta online
# Ve a: https://www.uuidgenerator.net/
```

Guarda este valor, lo necesitarás para las variables de entorno.

## Paso 3: Subir Código a GitHub

```bash
# Desde la carpeta raíz del proyecto
git add server/vercel.json server/.env.example server/DEPLOYMENT.md
git commit -m "feat: Configure backend for Vercel deployment

- Add vercel.json for serverless deployment
- Add environment variables template
- Add deployment documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

## Paso 4: Crear Nuevo Proyecto en Vercel (Backend)

1. **Ve al Dashboard de Vercel**: https://vercel.com/dashboard

2. **Crear Nuevo Proyecto**:
   - Haz clic en **"Add New..."** → **"Project"**
   - Busca y selecciona **"ChapulinaApp"**
   - Haz clic en **"Import"**

3. **Configurar el Proyecto**:
   - **Project Name**: `chapulina-api` (o el nombre que prefieras)
   - **Framework Preset**: Selecciona **"Other"**
   - **Root Directory**: Haz clic en **"Edit"** y selecciona **"server"**
   - **Build Command**: Déjalo vacío (no necesita build)
   - **Output Directory**: Déjalo vacío
   - **Install Command**: `npm install`

4. **Configurar Variables de Entorno** (MUY IMPORTANTE):

   Antes de hacer deploy, expande **"Environment Variables"** y agrega:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `NODE_ENV` | `production` | Production, Preview, Development |
   | `MONGODB_URI` | `mongodb+srv://tomasvarelaa19_db_user:mojito2142@chapulinadb.z8uch4v.mongodb.net/chapulina?appName=chapulinadb` | Production, Preview, Development |
   | `JWT_SECRET` | `[tu_clave_generada_en_paso_2]` | Production, Preview, Development |
   | `JWT_EXPIRE` | `7d` | Production, Preview, Development |
   | `CLIENT_URL` | `https://chapulina-app.vercel.app` | Production, Preview, Development |

   ⚠️ **Nota sobre CLIENT_URL**:
   - Si aún no has desplegado el frontend, usa temporalmente: `http://localhost:5173`
   - Después del deploy del frontend, actualiza este valor con la URL real

5. **Hacer Deploy**:
   - Haz clic en **"Deploy"**
   - Espera 1-2 minutos mientras Vercel construye y despliega

6. **Copiar la URL del Backend**:
   - Una vez completado, verás algo como: `https://chapulina-api.vercel.app`
   - **Copia esta URL**, la necesitarás para el frontend

## Paso 5: Verificar que el Backend Funciona

1. **Abre la URL de tu backend** en el navegador:
   ```
   https://chapulina-api.vercel.app
   ```

2. Deberías ver:
   ```json
   {
     "success": true,
     "message": "Chapulina API is running..."
   }
   ```

3. **Probar endpoint de API**:
   ```
   https://chapulina-api.vercel.app/api/products
   ```

Si ves errores, revisa los logs en Vercel:
- Ve a tu proyecto en Vercel
- Haz clic en la pestaña **"Deployments"**
- Haz clic en el deployment más reciente
- Revisa la pestaña **"Functions"** para ver los logs

## Paso 6: Actualizar Frontend con la URL del Backend

1. **Ve al proyecto del Frontend en Vercel**:
   - Dashboard → Selecciona "chapulina-app"

2. **Actualizar Variable de Entorno**:
   - Ve a **"Settings"** → **"Environment Variables"**
   - Busca `VITE_API_URL`
   - Haz clic en el ícono de editar (lápiz)
   - Cambia el valor a: `https://chapulina-api.vercel.app/api`
   - Haz clic en **"Save"**

3. **Redeployar Frontend**:
   - Ve a la pestaña **"Deployments"**
   - Haz clic en el botón de tres puntos (...) del último deployment
   - Selecciona **"Redeploy"**
   - Confirma haciendo clic en **"Redeploy"**

## Paso 7: Configurar CORS en Vercel

Si el frontend ya está desplegado, actualiza la variable `CLIENT_URL`:

1. En el proyecto del backend en Vercel
2. Ve a **"Settings"** → **"Environment Variables"**
3. Edita `CLIENT_URL` con la URL de tu frontend:
   ```
   https://chapulina-app.vercel.app
   ```
4. **Redeploy** el backend (como en el paso 6.3)

## Solución de Problemas

### Error: "Internal Server Error"
- Revisa los logs en Vercel → Deployments → Functions
- Verifica que todas las variables de entorno estén configuradas

### Error: "CORS Policy"
- Asegúrate de que `CLIENT_URL` tenga la URL correcta del frontend
- Redespliega el backend después de cambiar variables de entorno

### Error: "MongoDB Connection"
- Verifica que la IP 0.0.0.0/0 esté permitida en MongoDB Atlas Network Access
- Verifica que `MONGODB_URI` sea correcta e incluya el nombre de la base de datos

### Error 404 en rutas
- Asegúrate de que `vercel.json` esté en la carpeta `server/`
- Verifica que el Root Directory en Vercel esté configurado como "server"

## Variables de Entorno Completas (Resumen)

```env
# Backend (chapulina-api)
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chapulina
JWT_SECRET=[tu_clave_segura]
JWT_EXPIRE=7d
CLIENT_URL=https://chapulina-app.vercel.app

# Frontend (chapulina-app)
VITE_API_URL=https://chapulina-api.vercel.app/api
```

## Actualizaciones Automáticas

Vercel está conectado con tu repositorio de GitHub. Cada vez que hagas `git push`:
- El frontend se redesplega automáticamente
- El backend se redesplega automáticamente

¡Tu aplicación está lista para producción! 🎉
