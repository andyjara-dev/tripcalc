# TripCalc - Quick Reference

Comandos rápidos para operaciones comunes.

## 🚀 Deployment

```bash
# Deploy completo
./scripts/deploy.sh

# Health check
./scripts/check-health.sh

# Backup
./scripts/backup.sh

# Rollback
./scripts/rollback.sh [backup_name]
```

## 🐳 Docker

```bash
# Ver containers
docker ps

# Ver logs
docker logs -f tripcalc-prod

# Stats en tiempo real
docker stats tripcalc-prod

# Entrar al container
docker exec -it tripcalc-prod sh

# Restart
docker restart tripcalc-prod

# Stop/Start
docker stop tripcalc-prod
docker start tripcalc-prod
```

## 🎼 Docker Compose

```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# Ver status
docker-compose -f docker-compose.prod.yml ps
```

## 🌐 Nginx

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/tripcalc_access.log
sudo tail -f /var/log/nginx/tripcalc_error.log
```

## 🔒 SSL / Certbot

```bash
# Ver certificados
sudo certbot certificates

# Renovar
sudo certbot renew

# Test renovación
sudo certbot renew --dry-run

# Obtener certificado
sudo certbot --nginx -d tripcalc.site -d www.tripcalc.site
```

## 📊 Monitoreo

```bash
# Uso de CPU/Memoria
docker stats tripcalc-prod

# Disk usage
df -h
docker system df

# Ver procesos
docker top tripcalc-prod

# Container details
docker inspect tripcalc-prod

# Health status
docker inspect --format='{{.State.Health.Status}}' tripcalc-prod
```

## 🧹 Limpieza

```bash
# Limpiar containers parados
docker container prune

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar todo
docker system prune -a --volumes

# Limpiar logs
truncate -s 0 /var/log/nginx/tripcalc_*.log
```

## 🔍 Debugging

```bash
# Ver últimos 100 logs
docker logs tripcalc-prod --tail=100

# Ver logs con timestamp
docker logs tripcalc-prod -t

# Ver logs desde hace 1 hora
docker logs tripcalc-prod --since 1h

# Filtrar errores
docker logs tripcalc-prod 2>&1 | grep -i error

# Ver variables de entorno
docker exec tripcalc-prod env

# Test endpoint
curl http://localhost:3000
curl https://tripcalc.site
```

## 🔄 Updates

```bash
# 1. Pull changes
git pull origin main

# 2. Backup (opcional pero recomendado)
./scripts/backup.sh

# 3. Deploy
./scripts/deploy.sh

# 4. Verify
./scripts/check-health.sh
```

## 🚨 Emergency

```bash
# Restart rápido
docker restart tripcalc-prod

# Rollback rápido
./scripts/rollback.sh [último_backup]

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Ver qué usa el puerto 3000
sudo lsof -i :3000

# Ver memoria libre
free -h

# Ver disk space
df -h
```

## 📁 Archivos Importantes

```
~/apps/tripcalc/
├── .env.production              # Variables de entorno
├── docker-compose.prod.yml      # Config de producción
├── scripts/deploy.sh            # Script de deploy
└── nginx/tripcalc.site.conf     # Config de nginx

/etc/nginx/sites-available/
└── tripcalc.site                # Nginx config activo

/var/log/nginx/
├── tripcalc_access.log          # Access logs
└── tripcalc_error.log           # Error logs

~/backups/tripcalc/
└── tripcalc_*                   # Backups
```

## 🔗 URLs

```
Local:  http://localhost:3000
Public: https://tripcalc.site
API:    https://tripcalc.site/api/...
```

## 📞 Support

```bash
# Ver documentación completa
cat DEPLOYMENT_VPS.md
cat STEP2_COMPLETE.md
cat scripts/README.md

# Ver logs de deployment
cat deploy.log
cat health.log
cat backup.log
```

---

**Tip:** Guarda este archivo en favoritos para acceso rápido durante operaciones.
