# 🚀 Deploy TripCalc a tu VPS - Guía Rápida

Sigue estos pasos para deployar TripCalc en tu VPS en menos de 10 minutos.

## Pre-requisitos

En tu VPS debes tener:
- ✅ Docker instalado
- ✅ Docker Compose instalado
- ✅ Git instalado
- ✅ Nginx instalado
- ✅ Puerto 80 y 443 disponibles
- ✅ Dominio apuntando al servidor (tripcalc.site)

## Paso 1: Subir el Código al VPS

### Opción A: Con Git (Recomendado)

```bash
# En tu VPS
ssh usuario@tu-servidor.com
cd ~/apps
git clone https://github.com/tu-usuario/tripcalc.git
cd tripcalc
```

### Opción B: Con rsync (desde tu máquina local)

```bash
# Desde tu máquina local
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ usuario@tu-servidor.com:~/apps/tripcalc/
```

## Paso 2: Configurar Variables de Entorno

```bash
# En el VPS
cd ~/apps/tripcalc

# Crear archivo de producción
cp .env.production.example .env.production

# Editar con tu dominio
nano .env.production
```

Contenido de `.env.production`:

```env
NEXT_PUBLIC_SITE_URL=https://tripcalc.site
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

Guardar y salir (Ctrl+O, Enter, Ctrl+X).

## Paso 3: Deploy Inicial

```bash
# Hacer scripts ejecutables (si no lo están)
chmod +x scripts/*.sh

# Deploy!
./scripts/deploy.sh
```

Espera ~3 minutos. Verás:
```
🚀 Deploying TripCalc...
📥 Pulling latest code...
🛑 Stopping current container...
🔨 Building new image...
▶️  Starting container...
✅ Container is running
✅ Application is responding
✅ Deployment Complete!
```

## Paso 4: Configurar Nginx

```bash
# Copiar configuración
sudo cp nginx/tripcalc.site.conf /etc/nginx/sites-available/tripcalc.site

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/tripcalc.site /etc/nginx/sites-enabled/

# Test
sudo nginx -t

# Debe decir: "syntax is ok" y "test is successful"

# Reload nginx
sudo systemctl reload nginx
```

## Paso 5: Probar HTTP

```bash
# Test local
curl http://localhost:3000

# Test público
curl http://tripcalc.site
```

Si funciona, verás HTML de la página.

## Paso 6: Configurar SSL (HTTPS)

```bash
# Instalar certbot si no lo tienes
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d tripcalc.site -d www.tripcalc.site
```

Sigue las instrucciones:
1. Ingresa tu email
2. Acepta términos (Y)
3. Elige redirección HTTPS (opción 2)

## Paso 7: Verificar que Todo Funciona

```bash
# Health check
./scripts/check-health.sh
```

Deberías ver:
```
✅ Container is running
✅ Local endpoint responding
✅ Public endpoint responding
✅ Nginx is running
✅ SSL certificate exists
```

## Paso 8: Probar en Navegador

Abre tu navegador y visita:

🌐 **https://tripcalc.site**

¡Debería funcionar con HTTPS! 🎉

## Troubleshooting Rápido

### Container no inicia

```bash
docker logs tripcalc-prod
```

### Puerto 3000 ocupado

```bash
sudo lsof -i :3000
# Matar proceso si es necesario
sudo kill -9 [PID]
```

### Nginx error

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/tripcalc_error.log
```

### No conecta públicamente

```bash
# Verificar DNS
dig tripcalc.site

# Verificar firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Comandos Útiles Post-Deploy

```bash
# Ver logs
docker logs -f tripcalc-prod

# Stats
docker stats tripcalc-prod

# Restart
docker restart tripcalc-prod

# Backup
./scripts/backup.sh

# Health check
./scripts/check-health.sh
```

## Actualizaciones Futuras

Cada vez que quieras actualizar:

```bash
cd ~/apps/tripcalc
git pull origin main
./scripts/deploy.sh
```

¡Eso es todo! 2 comandos.

## Configurar Backups Automáticos (Opcional)

```bash
# Editar crontab
crontab -e

# Agregar (backup diario a las 2 AM)
0 2 * * * cd ~/apps/tripcalc && ./scripts/backup.sh >> backup.log 2>&1
```

## Resumen de URLs

- **Aplicación local**: http://localhost:3000
- **Aplicación pública**: https://tripcalc.site
- **Logs nginx**: /var/log/nginx/tripcalc_*.log
- **Backups**: ~/backups/tripcalc/

## Documentación Completa

Para más detalles, ver:
- **DEPLOYMENT_VPS.md** - Guía completa con troubleshooting
- **STEP2_COMPLETE.md** - Resumen del setup
- **QUICK_REFERENCE.md** - Comandos rápidos
- **scripts/README.md** - Documentación de scripts

## Checklist Final

- [ ] Código en el servidor
- [ ] .env.production configurado
- [ ] Docker build exitoso
- [ ] Container corriendo (docker ps)
- [ ] Nginx configurado
- [ ] HTTP funciona (curl)
- [ ] SSL configurado
- [ ] HTTPS funciona (navegador)
- [ ] Health check verde
- [ ] Backups configurados

---

## 🎉 ¡Felicidades!

TripCalc está en producción en tu VPS.

**Tiempo total**: ~10 minutos
**Costo**: $0 adicional (usa tu VPS existente)
**Mantenimiento**: Automatizado con scripts

### Próximos pasos:

1. Configura backups automáticos (cron)
2. Monitorea logs de vez en cuando
3. Actualiza con `git pull + ./scripts/deploy.sh`

**Need help?** Ver DEPLOYMENT_VPS.md para troubleshooting detallado.
