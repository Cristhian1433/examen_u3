# Sistema de Autenticación y Bitácoras 🔐

Proyecto académico de autenticación con sesiones seguras y bitácoras de auditoría completo en **Node.js + Express + MariaDB**.

## 📋 Características

✅ **Registro y Login seguro** con bcrypt (10 rounds)  
✅ **Sesiones persistentes** en MariaDB  
✅ **3 Bitácoras de Auditoría:**
  - Accesos exitosos
  - Accesos fallidos
  - Cierres de sesión

✅ **Panel Admin** con estadísticas completas  
✅ **Panel Usuario** con información de sesión  
✅ **Reporte de Auditoría** en HTML y **PDF**  
✅ **Autenticación segura** con protección contra ataques  
✅ **Interfaz moderna y responsiva** con diseño profesional

## 🛠️ Tecnología

- **Backend:** Node.js + Express.js
- **Frontend:** EJS + CSS responsivo
- **Base de Datos:** MariaDB 10.x
- **Autenticación:** bcrypt + express-session
- **Seguridad:** Helmet.js + Validación
- **PDF:** PDFKit
- **Hosting:** Railway (recomendado)

## 🏗️ Estructura del Proyecto

```
Examen U3/
├── server.js                 # Configuración principal
├── db.js                     # Pool de conexiones
├── schema.sql                # Estructura de BD
├── package.json              # Dependencias
├── .env.example              # Variables de entorno
├── Procfile                  # Para despliegue Railway
│
├── controllers/
│   ├── authController.js     # Login, registro, logout
│   ├── adminController.js    # Panel admin
│   ├── userController.js     # Panel usuario
│   └── reportController.js   # Reportes y PDF
│
├── routes/
│   ├── auth.js               # Rutas de autenticación
│   ├── admin.js              # Rutas admin
│   └── user.js               # Rutas usuario
│
├── middleware/
│   ├── authMiddleware.js     # Verificar sesión
│   ├── roleMiddleware.js     # Verificar rol
│   └── errorHandler.js       # Manejo de errores
│
├── services/
│   └── logger.js             # Logging a bitácoras
│
├── views/
│   ├── login.ejs             # Página de login
│   ├── register.ejs          # Página de registro
│   ├── admin-panel.ejs       # Panel administrador
│   ├── audit-report.ejs      # Reporte auditoría
│   ├── user-panel.ejs        # Panel usuario
│   ├── error.ejs             # Página de error
│   └── index.ejs             # Página de inicio
│
├── public/css/
│   └── style.css             # Estilos responsivos
│
├── docs/
│   ├── README.md             # Este archivo
│   ├── RAILWAY_DEPLOY.md     # Guía de despliegue
│   └── MARIADB_SETUP.md      # Setup de BD
```

## 📦 Instalación Local

### Requisitos
- Node.js v16+
- MariaDB 10.x
- Git

### Pasos

```bash
# 1. Descargar/Clonar el proyecto
cd "Examen U3"

# 2. Instalar dependencias
npm install

# 3. Crear base de datos MariaDB
mysql -u root -p < schema.sql

# 4. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de MariaDB

# 5. Iniciar servidor
npm start
```

La aplicación estará en: **http://localhost:3000**
  - `sameSite: 'strict'` (protección CSRF)
  - `secure: true` en HTTPS (producción)
- **Validación de entrada:** correo válido, contraseña mínimo 6 caracteres
- **Middleware de autenticación:** `isAuthenticated()` en rutas protegidas
- **Middleware de autorización:** `requireRole()` por rol
- **Control de acceso:** admin solo ve admin panel, user solo ve user panel

## 🌐 Despliegue en Render

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "Proyecto inicial"
git remote add origin https://github.com/tu-usuario/examen-u3.git
git branch -M main
git push -u origin main
```

### Paso 2: Crear PostgreSQL en Render

1. Ve a [Render.com](https://render.com)
2. Login o crea cuenta
3. Nuevo → PostgreSQL
4. Completa:
   - Name: `examen-u3-db`
   - Database: `examen_u3`
   - User: `postgres`
   - Region: elige más cercana
5. Copia la connection string interna (Internal Database URL)

### Paso 3: Ejecutar schema en la BD remota

En Render, ve a tu BD → Connect → Browser
Copia y ejecuta el contenido de `schema.sql`

### Paso 4: Crear Web Service en Render

1. Nuevo → Web Service
2. Conecta tu repo de GitHub
3. Completa:
   - Name: `examen-u3`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Region: igual que la BD
4. Variables de entorno (Environment):
   ```
   DB_HOST=<host interno de la BD desde Render>
   DB_PORT=5432
   DB_NAME=examen_u3
   DB_USER=postgres
   DB_PASSWORD=<contraseña generada por Render>
   SESSION_SECRET=tu_secreto_super_seguro_aqui_12345
   PORT=3000
   NODE_ENV=production
   ```
5. Deploy

### Paso 5: Verificar en producción

Espera a que Render termine el build (2-3 min).

URL: `https://examen-u3.onrender.com` (ejemplo)

Prueba:
1. Accede a la URL
2. Registra un usuario
3. Login
4. Verifica bitácoras (como admin)
5. Logout

## 🐛 Problemas Comunes

### Error: "Cannot find module 'express'"

**Solución:** Ejecuta `npm install`

### Error: "Error al conectar a PostgreSQL"

**Causas:**
- PostgreSQL no está corriendo
- Credenciales incorrectas en `.env`
- BD no existe

**Solución:**
```bash
# Verifica PostgreSQL
psql -U postgres -c "SELECT version();"

# Verifica la BD existe
psql -U postgres -l | grep examen_u3

# Si no existe:
createdb -U postgres examen_u3
psql -U postgres -d examen_u3 -f schema.sql
```

### Error: "Table 'session' doesn't exist"

**Solución:** Ejecuta el schema.sql completo:
```bash
psql -U postgres -d examen_u3 -f schema.sql
```

### Sesiones no se persisten después de reiniciar

**Solución:** Verifica que `connect-pg-simple` esté instalado:
```bash
npm install connect-pg-simple
```

### Cookies no funcionan en producción (Render)

**Verificar:**
- `NODE_ENV=production` en variables
- `secure: true` está en el código (ya está)
- HTTPS está activo (Render lo proporciona por defecto)

### Errores de CORS

**Solución:** El proyecto no usa CORS (backend + frontend integrados). Si usas API externa, agrega:
```javascript
const cors = require('cors');
app.use(cors());
```

### Base de datos en Render muestra "Connection refused"

**Solución:**
- Espera 2-3 minutos a que Render inicie la BD
- Verifica que la connection string sea la **interna** (no externa)
- En las variables, usa el host **interno** que Render proporciona

## 📊 Prueba Académica de Sesión

Para demostrar cómo funciona la seguridad de sesión:

1. **Inicia sesión** en Chrome:
   ```
   - Va a http://localhost:3000
   - Registra: test@test.com / password123 / user
   - Login
   - Ve el session_id en el panel
   ```

2. **Abre incógnito** en el mismo navegador:
   ```
   - Ctrl+Shift+P (Chrome) o Cmd+Shift+P (Mac)
   - Intenta acceder a http://localhost:3000/user/panel
   - ¿Qué pasa? → Se redirige a /auth/login
   ```

3. **Por qué?**
   - La sesión está en una **cookie** del navegador
   - La cookie NO se comparte entre ventanas normales e incógnito
   - Aunque supieras el session_id, necesitarías la cookie HTTP-only
   - HTTP-only significa: **no accesible desde JavaScript**, protegida contra XSS

4. **Concepto clave:**
   ```
   Riesgo sin protección:
   - Alguien captura el session_id
   - Lo reutiliza en otro navegador/máquina
   - ¡Acceso sin contraseña!

   Con protección (nuestro sistema):
   - Cookie httpOnly + sameSite
   - User-Agent registrado
   - IP registrada
   - Regeneración en login
   - → Mucho más difícil de explotar
   ```

## 📚 Archivos de Referencia

- **Schema SQL:** [schema.sql](schema.sql)
- **Variables de entorno:** [.env.example](.env.example)
- **Rutas:** [routes/](routes/)
- **Middlewares:** [middleware/](middleware/)
- **Controladores:** [controllers/](controllers/)
- **Vistas:** [views/](views/)
- **Estilos:** [public/css/style.css](public/css/style.css)

## 📄 Licencia

MIT

---

**Desarrollado con ❤️ para el Examen U3**
