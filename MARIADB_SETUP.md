# 🚀 GUÍA DE CONFIGURACIÓN CON MARIADB

## PASO 1: Crear la Base de Datos

Abre **MySQL Workbench** o la línea de comandos de MariaDB/MySQL:

```sql
-- Crear la base de datos
CREATE DATABASE examen_u3;

-- Usar la base de datos
USE examen_u3;

-- Ejecutar el schema.sql aquí (copiar todo el contenido y pegar)
```

O desde PowerShell:

```powershell
mysql -u root -p < schema.sql
```

Si MariaDB está en tu PATH, también puedes:

```powershell
# Crear la BD
mysql -u root -e "CREATE DATABASE examen_u3;"

# Ejecutar schema
mysql -u root examen_u3 < schema.sql
```

## PASO 2: Actualizar archivo `.env`

Abre `.env` y configura:

```env
# MariaDB - Cambia estos valores según tu instalación
DB_HOST=localhost
DB_PORT=3306
DB_NAME=examen_u3
DB_USER=root
DB_PASSWORD=tu_contraseña_si_la_tienes

# Sesión
SESSION_SECRET=asdfghjkl1234567890qwertyuiopzxcvbnm

# Servidor
PORT=3000
NODE_ENV=development
```

**Notas:**
- `DB_PORT`: 3306 es el puerto default de MariaDB/MySQL
- `DB_USER`: Por defecto es `root` en instalaciones locales
- `DB_PASSWORD`: Si lo dejaste vacío en la instalación, también va vacío aquí

## PASO 3: Iniciar el Servidor

```powershell
npm start
```

Deberías ver:
```
Servidor corriendo en puerto 3000
Ambiente: development
```

## PASO 4: Acceder al Sitio

Abre en navegador:
```
http://localhost:3000
```

## ✅ Cambios desde PostgreSQL

Se cambió:

| Aspecto | PostgreSQL | MariaDB |
|--------|-----------|---------|
| Puerto | 5432 | 3306 |
| Usuario | postgres | root |
| Driver | pg | mysql2 |
| Store Sesiones | connect-pg-simple | express-mysql-session |
| Sintaxis SQL | $1, $2 | ?, ? |
| Tabla sesiones | Manual | Automática |

## 🐛 Troubleshooting

### Error: "Connection refused"

**Causa:** MariaDB no está corriendo

**Solución:**
```powershell
# Verificar si el servicio está activo
Get-Service MySQL* 
Get-Service MariaDB*

# Si no está, iniciarlo:
Start-Service MySQL80  # o el nombre correspondiente
# o en Linux/Mac:
# sudo systemctl start mariadb
```

### Error: "Access denied for user 'root'"

**Causa:** Contraseña incorrecta

**Solución:**
1. Ve a `.env`
2. Asegúrate de que `DB_PASSWORD` sea correcto
3. Si no tiene contraseña, dejalappp en blanco

### Error: "Unknown database 'examen_u3'"

**Causa:** Base de datos no creada

**Solución:**
```powershell
mysql -u root
# En el prompt MySQL:
CREATE DATABASE examen_u3;
USE examen_u3;
# Copiar y pegar todo el contenido de schema.sql
```

### Las tablas no se crean

**Solución:**
```powershell
# Asegúrate de estar dentro de la BD correcta
mysql -u root examen_u3 < schema.sql

# O manualmente:
mysql -u root
USE examen_u3;
# Pegar contenido de schema.sql línea por línea o completo
```

## 📝 Notas de Seguridad

- En producción (Render), usa una contraseña fuerte
- Nunca hagas push de `.env` a GitHub (usa `.gitignore`)
- Para Render, crea una BD en su panel, no uses MariaDB local

---

¡Listo! Tu proyecto ya funciona con MariaDB.
