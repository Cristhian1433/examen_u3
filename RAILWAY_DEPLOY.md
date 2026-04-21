# 🚀 Guía de Despliegue en Railway

Este documento explica cómo desplegar el proyecto **Sistema de Autenticación y Bitácoras** en **Railway**.

## Requisitos Previos

1. **Cuenta en GitHub** (con el proyecto subido)
2. **Cuenta en Railway** (https://railway.app)
3. **Git instalado** en tu computadora

## Paso 1: Preparar el Proyecto Localmente

### 1.1 Verificar que todo esté en Git

```bash
cd "Examen U3"
git init
git add .
git commit -m "Initial commit - Sistema de Autenticación"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### 1.2 Variables de Entorno

El archivo `.env.example` ya contiene las variables necesarias:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `SESSION_SECRET`
- `PORT`
- `NODE_ENV`

## Paso 2: Crear Proyectos en Railway

### 2.1 Crear Base de Datos MySQL

1. Ve a https://railway.app/dashboard
2. Click en **"New Project"**
3. Selecciona **"Provision New"** → **"MySQL"**
4. Railway crea automáticamente una BD MySQL (También soporta MariaDB)
5. Espera a que se despliegue

### 2.2 Conectar tu Repositorio GitHub

1. En Railway, click en **"New"** → **"GitHub Repo"**
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio `Examen U3`
4. Click en **Deploy**

## Paso 3: Configurar Variables de Entorno en Railway

### 3.1 Para la Base de Datos MySQL

Railway genera automáticamente variables cuando despliegas MySQL:

Ve al servicio MySQL en Railway y copia:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

### 3.2 Para la Aplicación Node.js

En el servicio de tu app Node.js, ve a **Variables** y agrega:

```
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_NAME=${MYSQLDATABASE}
DB_USER=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
PORT=3000
NODE_ENV=production
SESSION_SECRET=<GENERA_UN_VALOR_SEGURO_AQUI>
```

### 3.3 Generar SESSION_SECRET Seguro

Ejecuta en tu terminal local:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el valor generado y pégalo en `SESSION_SECRET` en Railway.

## Paso 4: Crear la Base de Datos

### 4.1 Obtener Conexión a la BD

En Railway, ve a tu servicio MySQL → **Connect** y copia los datos de conexión.

### 4.2 Ejecutar Script de Esquema

Opción A: **Desde tu computadora** (recomendado para prueba)

```bash
mysql -h <MYSQLHOST> -u <MYSQLUSER> -p<MYSQLPASSWORD> -P <MYSQLPORT> <MYSQLDATABASE> < schema.sql
```

Opción B: **Desde Railway CLI**

```bash
railway login
railway link <PROJECT_ID>
railway exec mysql -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < schema.sql
```

## Paso 5: Desplegar

1. Railway detecta automáticamente que es una app Node.js
2. Ejecuta `npm install` automáticamente
3. Ejecuta el comando en **Procfile**: `web: node server.js`
4. Espera a que termine el despliegue

## Paso 6: Acceder a tu Aplicación

Una vez desplegada, Railway te proporciona una **URL pública**:

Ejemplo: `https://examen-u3-production.up.railway.app`

Accede a esa URL y verás el login.

## 🔗 Flujo Completo en Railway

```
GitHub Repo → Railway → Detecta Node.js → Instala dependencias
                             ↓
                        Conecta con MySQL
                             ↓
                        Ejecuta server.js
                             ↓
                        URL pública generada
```

## Troubleshooting

### El app no inicia

1. Verifica los logs: **Deployment** → **Logs**
2. Busca errores de conexión a BD
3. Verifica que `DB_HOST`, `DB_PORT`, etc. estén correctas

### La BD no conecta

1. Verifica que MySQL está **running** en Railway
2. Comprueba credenciales en **Connect**
3. Ejecuta el schema.sql otra vez

### Errores de puertos

Railway asigna el puerto automáticamente en variable `$PORT`. 

Nuestro `server.js` ya lo maneja:
```javascript
const PORT = process.env.PORT || 3000;
```

## Archivos Incluidos

- ✅ `Procfile` - Define cómo ejecutar la app
- ✅ `package.json` - Dependencias
- ✅ `.env.example` - Variables de entorno
- ✅ `schema.sql` - Estructura de base de datos

## Recursos Útiles

- 📖 [Documentación Railway](https://docs.railway.app)
- 🆘 [Railway Support](https://railway.app/support)
- 📱 [Railway CLI](https://docs.railway.app/develop/cli)

## 💡 Tips

1. Railway tiene plan **gratuito** pero limitado (limpia si no usas)
2. Puedes **rollback** a versiones anteriores en Railway
3. Monitorea **usage** en el dashboard
4. La BD persiste entre despliegues

---

**¡Tu app está lista para el mundo! 🌍**

Accede a tu URL pública y comparte con tus profes.
