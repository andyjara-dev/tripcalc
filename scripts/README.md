# TripCalc Deployment Scripts

Scripts de utilidad para deployment y mantenimiento de TripCalc en producción.

## Scripts Disponibles

### 🏙️ City Data Migration Scripts

#### verify-city-data.ts
Verifica qué ciudades están en la base de datos y si tienen todos sus datos adicionales completos.

```bash
npm run cities:verify
```

**Verifica:**
- Daily Costs (Budget, Mid-range, Luxury)
- Transport Options (Metro, Bus, Taxi, etc.)
- Tips & Advice
- Cash Info

#### migrate-city-data.ts
Migra los datos adicionales desde archivos TypeScript estáticos a la base de datos.

```bash
npm run cities:migrate
```

**Migra:**
- Daily costs para 3 travel styles
- Opciones de transporte (8+ por ciudad)
- Tips categorizados
- Información de efectivo y pagos

Ver documentación completa de migración al final de este documento.

---

### 🚀 deploy.sh
Script principal de deployment.

```bash
./scripts/deploy.sh
```

**Funciones:**
- Pull de últimos cambios de Git
- Stop del contenedor actual
- Build de nueva imagen
- Start del contenedor
- Verificación de salud
- Muestra logs y stats

### 🏥 check-health.sh
Verifica el estado del deployment.

```bash
./scripts/check-health.sh
```

**Verifica:**
- Estado del contenedor Docker
- Endpoint local (localhost:3000)
- Endpoint público (tripcalc.site)
- Estado de Nginx
- Certificado SSL
- Uso de recursos
- Errores recientes en logs

### 💾 backup.sh
Crea backup completo del proyecto.

```bash
./scripts/backup.sh
```

**Backup incluye:**
- Imagen Docker
- Código fuente
- Variables de entorno
- Mantiene últimos 5 backups

**Ubicación:** `~/backups/tripcalc/`

### ⏮️ rollback.sh
Hace rollback a un backup previo.

```bash
# Ver backups disponibles
./scripts/rollback.sh

# Hacer rollback
./scripts/rollback.sh tripcalc_20260127_120000
```

**Proceso:**
- Stop del contenedor actual
- Carga de imagen de backup
- Restaura código y env
- Start del contenedor
- Verificación

### 🧪 test-docker.sh
Prueba local del build de Docker.

```bash
./scripts/test-docker.sh
```

**Funciones:**
- Build de imagen de test
- Run del contenedor
- Test de endpoint
- Cleanup automático

## Uso Típico

### Deployment inicial

```bash
# 1. Configurar servidor
ssh usuario@servidor
cd ~/apps/tripcalc

# 2. Clonar repo
git clone [repo] .

# 3. Configurar env
cp .env.production.example .env.production
nano .env.production

# 4. Hacer ejecutables los scripts
chmod +x scripts/*.sh

# 5. Deploy
./scripts/deploy.sh
```

### Actualización

```bash
# En tu servidor
cd ~/apps/tripcalc

# Backup antes de actualizar
./scripts/backup.sh

# Deploy nueva versión
./scripts/deploy.sh

# Verificar salud
./scripts/check-health.sh
```

### En caso de problemas

```bash
# Ver backups disponibles
./scripts/rollback.sh

# Rollback a versión anterior
./scripts/rollback.sh tripcalc_20260127_120000

# Verificar que funcionó
./scripts/check-health.sh
```

## Automatización

### Cron Job para backups diarios

```bash
# Editar crontab
crontab -e

# Agregar línea (backup diario a las 2 AM)
0 2 * * * cd ~/apps/tripcalc && ./scripts/backup.sh >> ~/apps/tripcalc/backup.log 2>&1
```

### Cron Job para health checks

```bash
# Health check cada hora
0 * * * * cd ~/apps/tripcalc && ./scripts/check-health.sh >> ~/apps/tripcalc/health.log 2>&1
```

## Logs

### Ver logs en tiempo real

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Ver logs de nginx

```bash
sudo tail -f /var/log/nginx/tripcalc_access.log
sudo tail -f /var/log/nginx/tripcalc_error.log
```

### Ver logs de deployment

```bash
tail -f ~/apps/tripcalc/backup.log
tail -f ~/apps/tripcalc/health.log
```

## Troubleshooting

### Container no inicia

```bash
# Ver logs detallados
docker logs tripcalc-prod

# Verificar recursos
docker stats tripcalc-prod --no-stream

# Verificar puerto
sudo lsof -i :3000

# Rebuild sin cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Nginx error

```bash
# Test configuración
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/tripcalc_error.log

# Restart nginx
sudo systemctl restart nginx
```

### SSL error

```bash
# Ver certificados
sudo certbot certificates

# Renovar
sudo certbot renew

# Test renovación
sudo certbot renew --dry-run
```

## Variables de Entorno

Las variables de entorno se configuran en `.env.production`:

```env
NEXT_PUBLIC_SITE_URL=https://tripcalc.site
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Comandos Útiles

```bash
# Reiniciar contenedor
docker-compose -f docker-compose.prod.yml restart

# Ver stats en tiempo real
docker stats tripcalc-prod

# Entrar al contenedor
docker exec -it tripcalc-prod sh

# Ver uso de disco
docker system df

# Limpiar recursos sin usar
docker system prune -a
```

## Seguridad

- ✅ Nunca commitear `.env.production`
- ✅ Backups se guardan fuera del repo
- ✅ Scripts verifican errores (`set -e`)
- ✅ Confirmación antes de rollback
- ✅ SSL configurado con Let's Encrypt

## Mantenimiento

### Semanal
- Verificar logs de errores
- Revisar uso de recursos
- Verificar espacio en disco

### Mensual
- Verificar renovación de SSL
- Limpiar backups antiguos
- Update de dependencias

### Trimestral
- Audit de seguridad
- Update de imágenes Docker
- Review de configuración nginx

---

## 🏙️ City Data Migration - Guía Completa

### Verificar Estado de Ciudades

```bash
npm run cities:verify
```

**Salida de ejemplo:**
```
📍 Barcelona (barcelona)
   Country: Spain
   Currency: €EUR
   Published: ✅
   Additional Data:
      Daily Costs: 3 travel styles ✅
      Transport: 8 options ✅
      Tips: 4 tips ✅
      Cash Info: ✅

📊 Summary:
   Cities with Daily Costs: 5/5
   Cities with Transport: 5/5
   Cities with Tips: 5/5
   Cities with Cash Info: 5/5
```

### Migrar Datos de Ciudades

```bash
npm run cities:migrate
```

Este script:
- ✅ Lee datos de `/data/cities/*.ts`
- ✅ Convierte formato antiguo al nuevo schema
- ✅ No duplica datos existentes
- ✅ Safe to re-run

**Conversiones:**
- Daily costs: Budget, Mid-range, Luxury
- Transport: Metro, Bus, Taxi, Uber, Train
- Tips: Por categoría (food, transport, general)
- Cash info: Nivel de efectivo, ATMs, tarjetas

### Workflow Recomendado

1. **Verificar:** `npm run cities:verify`
2. **Migrar (si faltan datos):** `npm run cities:migrate`
3. **Verificar de nuevo:** `npm run cities:verify`
4. **Ver en Prisma Studio:** `npm run db:studio`

### Notas Importantes

- 💰 Precios almacenados en centavos (×100)
- 🔄 Safe to re-run (no duplica)
- 🏷️ Travel styles: `budget`, `midRange`, `luxury`
- 🚇 Transport types: `metro`, `bus`, `taxi`, `uber`, `train`

---

Para más información, ver [DEPLOYMENT_VPS.md](../DEPLOYMENT_VPS.md)
