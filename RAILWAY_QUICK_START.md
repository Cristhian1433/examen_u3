# 🚀 Guía Rápida: Desplegar en Railway (5 minutos)

## 🎯 Objetivo

Subir tu app a **Railway.app** y acceder desde cualquier navegador.

---

## ⚡ Pasos Rápidos

### **1. Preparar GitHub**

```bash
# Si NO está en Git:
git init
git add .
git commit -m "Sistema de Autenticación - Examen U3"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### **2. Crear Cuenta Railway**

1. Ve a https://railway.app
2. Sign up con GitHub
3. Autoriza Railway

### **3. Crear Proyecto en Railway**

1. Dashboard → **New Project**
2. Selecciona **"Add from GitHub Repo"**
3. Conecta tu repositorio `Examen U3`
4. Click **Deploy**

### **4. Agregar Base de Datos MySQL**

En tu proyecto Railway:
1. Click **"Add"** → **"Provision"** → **"MySQL"**
2. Railway automáticamente:
   - Crea la BD MySQL
   - Genera credenciales
   - Las asigna como variables de entorno

### **5. Configurar Variables de Entorno**

En el servicio de tu app Node.js, ve a **Variables**:

```
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_NAME=${MYSQLDATABASE}
DB_USER=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
PORT=3000
NODE_ENV=production
SESSION_SECRET=<VER PASO 6>
```

### **6. Generar SESSION_SECRET**

En tu terminal local:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado (texto largo) y pégalo en `SESSION_SECRET` en Railway.

### **7. Ejecutar Schema de BD**

Opción A: **Desde tu computadora** (más fácil)

```bash
# Obtén la conexión del servicio MySQL en Railway
# Verás algo como: mysql://user:pass@host:3306/db

mysql -h <MYSQLHOST> -u <MYSQLUSER> -p<MYSQLPASSWORD> -P <MYSQLPORT> <MYSQLDATABASE> < schema.sql
```

Opción B: **Desde Railway CLI**

```bash
railway login
railway link <PROJECT_ID>
railway exec mysql -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < schema.sql
```

### **8. ¡Listo! 🎉**

Railway detecta automáticamente:
- ✅ Que es Node.js
- ✅ El `Procfile` con `web: node server.js`
- ✅ Instala dependencias (`npm install`)
- ✅ Conecta con MySQL
- ✅ Genera URL pública

**Tu app está disponible en:** `https://examen-u3-production.up.railway.app` (o similar)

---

## 📋 Checklist Final

- [ ] GitHub repo creado y subido
- [ ] Railway account creado
- [ ] Proyecto conectado en Railway
- [ ] MySQL creado en Railway
- [ ] Variables de entorno configuradas
- [ ] SESSION_SECRET generado
- [ ] Schema ejecutado en BD
- [ ] Deployment exitoso
- [ ] URL pública accesible

---

## 🔗 URLs Importantes

| Elemento | URL |
|----------|-----|
| Railway | https://railway.app |
| Tu App | https://examen-u3-production.up.railway.app |
| Dashboard | https://railway.app/dashboard |

---

## 💡 Tips

1. **Logging**: Ve a **Deployments** → **Logs** si hay error
2. **Rollback**: Railway guarda historial, puedes volver a versión anterior
3. **Prueba**: Después de desplegar, prueba:
   - Registrarse: `/auth/register`
   - Login: `/auth/login`
   - Admin panel: `/admin/panel`
   - Reporte: `/admin/reporte`

---

## ❌ Errores Comunes

**Error: "Cannot find database"**
- Ejecutaste el schema? ✓
- Credenciales correctas? ✓

**Error: "PORT is not listening"**
- Railway asigna el puerto automáticamente
- Nuestro `server.js` ya lo maneja: `process.env.PORT || 3000`

**Error: "Cannot connect to DB"**
- Verifica que variables de entorno estén escritas correctamente
- Revisa Logs en Railway

---

## 🆘 Necesitas Ayuda?

1. Revisa los **Logs** en Railway
2. Verifica **Variables** de entorno
3. Confirma que MySQL está **Running**
4. Lee [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) para más detalles

---

**¡Tu app en la nube en 5 minutos! 🌍**
