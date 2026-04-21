# 🚀 GUÍA COMPLETA DE DESPLIEGUE EN RENDER

Este archivo contiene instrucciones detalladas y paso a paso para desplegar tu proyecto en Render.

## FASE 1: PREPARAR EL REPOSITORIO EN GITHUB

### 1.1 Crear repositorio

```bash
# Abre GitHub.com y crea un nuevo repositorio llamado "examen-u3"
# NO inicialices con README, .gitignore, ni LICENSE (lo hacemos en local)
```

### 1.2 Configurar Git local

```bash
# En tu carpeta del proyecto:
cd "c:\Users\andri\OneDrive\Documentos\Escuela\Desarrollo web\Examen U3"

# Inicializar git
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Proyecto inicial: sistema de autenticación con bitácoras"

# Renombrar rama a main
git branch -M main

# Agregar remote
git remote add origin https://github.com/TU_USUARIO/examen-u3.git

# Push inicial
git push -u origin main
```

## FASE 2: CREAR BASE DE DATOS EN RENDER

### 2.1 Acceder a Render

1. Ve a [https://render.com](https://render.com)
2. Click en "Sign Up"
3. Crea cuenta con email o GitHub (recomendado GitHub)
4. Confirma email

### 2.2 Crear PostgreSQL

1. En dashboard, click en "+"
2. Selecciona "PostgreSQL"
3. Completa:
   - **Name:** `examen-u3-db`
   - **Database:** `examen_u3`
   - **User:** `postgres`
   - **Region:** elige la más cercana a ti
   - **PostgreSQL Version:** 12 o superior
4. Click "Create Database"

### 2.3 Esperar y obtener credenciales

Render tardará 2-3 minutos en crear la BD.

Una vez lista, verás en la página:
- **Host:** (algo como `dpg-xxx.render.com`)
- **Port:** `5432`
- **Database:** `examen_u3`
- **User:** `postgres`
- **Password:** (generada automáticamente)
- **External Database URL:** `postgresql://...` (con contraseña)
- **Internal Database URL:** `postgresql://...` (sin contraseña, para servicios internos)

**⚠️ IMPORTANTE:** Para el Web Service, usaremos la URL **interna**.

### 2.4 Ejecutar schema.sql en la BD remota

1. En la página de la BD, busca "Connect"
2. Click en "Browser" (abre pgAdmin web)
3. Copia TODO el contenido de tu archivo `schema.sql`
4. Pégalo en el Query Editor
5. Ejecuta (Ctrl+Enter o botón Run)

Verás mensajes como:
```
CREATE TABLE
CREATE TABLE
...
CREATE INDEX
```

**✅ Listo:** La BD remota ya tiene todas las tablas.

## FASE 3: CREAR WEB SERVICE EN RENDER

### 3.1 Conectar GitHub a Render

1. En dashboard, click en "+"
2. Selecciona "Web Service"
3. Click en "Connect your GitHub repository"
4. Autoriza Render en GitHub
5. Busca `examen-u3` en la lista
6. Click "Connect"

### 3.2 Configurar el Web Service

**Build Settings:**
- **Name:** `examen-u3`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Region:** Elige la misma que la BD

**⚠️ IMPORTANTE:**
No toques "Runtime" ni "Build Filter". Deja defaults.

### 3.3 Agregar variables de entorno

Scroll down → "Environment"

Agrega estas variables exactamente (copia los valores de Render):

```
DB_HOST=dpg-xxxxx.render.com
DB_PORT=5432
DB_NAME=examen_u3
DB_USER=postgres
DB_PASSWORD=<copia de Render>
SESSION_SECRET=asdfghjkl1234567890qwertyuiopzxcvbnm123456789
PORT=10000
NODE_ENV=production
```

**Dónde obtener cada valor:**

- **DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD:** De la página de tu PostgreSQL en Render (sección "Connect")
- **SESSION_SECRET:** Algo largo y aleatorio (ya está en tu `.env` local, cópialo o genera otro)
- **PORT:** Render asigna dinámicamente, pero escribe cualquier puerto (ej. 10000)
- **NODE_ENV:** Siempre `production` en Render

### 3.4 Crear el servicio

Click en "Create Web Service"

Render comienza a:
1. Clonar tu repositorio
2. Instalar dependencias (`npm install`)
3. Iniciar el servidor (`npm start`)

**Esto tardará 3-5 minutos.** Puedes ver el progreso en "Logs".

## FASE 4: VERIFICAR DESPLIEGUE

### 4.1 Esperar hasta "deployed"

En el dashboard del Web Service, verás el estado. Espera a que cambie a:
```
✓ Deploy live
```

### 4.2 Obtener URL pública

Una vez "deployed", verás una URL como:
```
https://examen-u3.onrender.com
```

(El nombre exacto depende de lo que pusiste en "Name")

### 4.3 Acceder al sitio

Abre en navegador:
```
https://examen-u3.onrender.com
```

Deberías ver:
- Página de inicio con botones "Registrarse" e "Iniciar Sesión"

Si ves error:
- Ve a "Logs" del Web Service en Render
- Lee los errores
- Común: Variables de entorno faltantes o mal configuradas

## FASE 5: PRUEBAS EN PRODUCCIÓN

### 5.1 Crear usuario admin

1. Click "Registrarse"
2. Completa:
   - Nombre: Carlos Admin
   - Correo: admin@test.com
   - Contraseña: admin123456
   - Rol: admin
3. Click "Registrarse"
4. Se redirige a login
5. Ingresa credenciales
6. Verás panel admin

### 5.2 Verificar bitácoras

1. Como admin, click "Accesos Correctos"
2. Deberías ver el registro del login que acabas de hacer
3. Click "Accesos Fallidos"
4. Intenta login con correo incorrecto
5. Vuelve a "Accesos Fallidos"
6. Verás el registro del intento fallido

### 5.3 Crear usuario regular

1. Logout
2. Registra: user@test.com / user123456 / user
3. Login
4. Verás panel usuario simplificado

### 5.4 Logout y ciclo completo

1. Click "Cerrar Sesión"
2. Regresa a inicio
3. Como admin, verifica que aparezca en "Cierres de Sesión"

## 🔧 TROUBLESHOOTING

### Error: "Failed to connect to PostgreSQL"

**Causa:** Generalmente BD no disponible o credenciales incorrectas.

**Solución:**
1. Ve a la página de tu PostgreSQL en Render
2. Copia exactamente: Host, Port, Name, User, Password
3. En el Web Service, ve a "Environment"
4. Edita cada variable
5. Guarda cambios
6. Render redeploy automáticamente

### Error: "Table session does not exist"

**Causa:** Schema.sql no se ejecutó en la BD remota.

**Solución:**
1. Ve a tu PostgreSQL en Render
2. Click "Connect" → "Browser"
3. Copia TODO de schema.sql
4. Pega en Query Editor
5. Ejecuta
6. Reinicia el Web Service (botón "Manual Deploy" en Render)

### Página en blanco o 502 Bad Gateway

**Causa:** Error en el servidor.

**Solución:**
1. Ve a "Logs" del Web Service
2. Lee el error (suele estar al inicio)
3. Errores comunes:
   - Variable de entorno faltante → Agrégala en Environment
   - Módulo no instalado → Revisa `npm install` en package.json
   - Conexión BD rechazada → Verifica credenciales

### ¿Cómo reiniciar sin hacer push?

En Render:
1. Web Service → "Manual Deploy"
2. Click "Deploy latest" (reinicia sin cambiar código)

### ¿Cómo hacer pull de cambios?

Desde local:
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Render detecta el push automáticamente y redeploy.

## 📋 CHECKLIST FINAL

- ✅ Repositorio en GitHub
- ✅ PostgreSQL creado en Render
- ✅ Schema.sql ejecutado en BD remota
- ✅ Web Service creado en Render
- ✅ Variables de entorno configuradas
- ✅ Sitio "deployed" (estado verde)
- ✅ Acceso desde URL pública
- ✅ Registra y login funcionando
- ✅ Bitácoras registrando eventos
- ✅ Panel admin mostrando datos

## 🎉 ¡Listo para demostración!

Tu aplicación está en producción. Puedes:
- Compartir la URL con profesores
- Registrar múltiples usuarios
- Demostrar funcionamiento de bitácoras
- Mostrar seguridad de sesiones

---

**Tiempo total:** ~20-30 minutos en la primera vez.
