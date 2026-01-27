# Deployment a VPS con Docker

Guía completa para deployar TripCalc en tu VPS existente con Docker.

## ⚠️ Puerto 3000 en uso?

Si el puerto 3000 ya está ocupado por otro proyecto:

```bash
# Opción 1: Usar script automático
./scripts/fix-port-conflict.sh

# Opción 2: Manual - Editar docker-compose.prod.yml
nano docker-compose.prod.yml
# Cambiar: - "3000:3000"
# A:       - "3010:3000"  (o el puerto que prefieras)

# Luego actualizar nginx:
sudo nano /etc/nginx/sites-available/tripcalc.site
# Cambiar: proxy_pass http://localhost:3000;
# A:       proxy_pass http://localhost:3010;
```

## Pre-requisitos en el VPS

- ✅ Docker instalado
- ✅ Docker Compose instalado
- ✅ Nginx (opcional, como reverse proxy)
- ✅ Puerto 80/443 disponible o configurado en nginx
- ✅ Git instalado

## Paso 1: Preparar el Servidor

### 1.1 Conectar al VPS

```bash
ssh tu-usuario@tu-servidor.com
```

### 1.2 Crear directorio para el proyecto

```bash
# Sugerencia: organizar por proyectos
mkdir -p ~/apps/tripcalc
cd ~/apps/tripcalc
```

### 1.3 Clonar el repositorio

```bash
# Si usas GitHub/GitLab
git clone https://github.com/tu-usuario/tripcalc.git .

# O subir archivos con rsync desde tu máquina local
# rsync -avz --exclude 'node_modules' --exclude '.next' ./ usuario@servidor:~/apps/tripcalc/
```

## Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo .env.production

```bash
nano .env.production
```

Contenido:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://tripcalc.site
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Future: Analytics, APIs, etc.
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2.2 Verificar configuración

```bash
cat .env.production
```

## Paso 3: Build y Deploy con Docker

### Opción A: Docker Compose (Recomendado)

#### 3.1 Usar docker-compose.prod.yml

```bash
# Build de la imagen
docker-compose -f docker-compose.prod.yml build

# Iniciar el contenedor
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 3.2 Verificar que está corriendo

```bash
docker ps | grep tripcalc
curl http://localhost:3000
```

### Opción B: Docker CLI

```bash
# Build
docker build -t tripcalc:production .

# Run
docker run -d \
  --name tripcalc \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  tripcalc:production

# Ver logs
docker logs -f tripcalc
```

## Paso 4: Configurar Nginx como Reverse Proxy

### 4.1 Crear configuración de nginx

```bash
sudo nano /etc/nginx/sites-available/tripcalc.site
```

### 4.2 Configuración básica (HTTP - temporal)

```nginx
server {
    listen 80;
    server_name tripcalc.site www.tripcalc.site;

    # Logs
    access_log /var/log/nginx/tripcalc_access.log;
    error_log /var/log/nginx/tripcalc_error.log;

    # Proxy a Docker container
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

### 4.3 Habilitar el sitio

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/tripcalc.site /etc/nginx/sites-enabled/

# Test configuración
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4.4 Verificar

```bash
curl http://tripcalc.site
```

## Paso 5: Configurar SSL con Let's Encrypt

### 5.1 Instalar Certbot (si no lo tienes)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

### 5.2 Obtener certificado SSL

```bash
sudo certbot --nginx -d tripcalc.site -d www.tripcalc.site
```

Certbot actualizará automáticamente tu configuración de nginx para usar HTTPS.

### 5.3 Configuración final de nginx con SSL

Certbot debería haber creado algo así:

```nginx
server {
    listen 80;
    server_name tripcalc.site www.tripcalc.site;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tripcalc.site www.tripcalc.site;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/tripcalc.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tripcalc.site/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Logs
    access_log /var/log/nginx/tripcalc_access.log;
    error_log /var/log/nginx/tripcalc_error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files optimization (Next.js)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

### 5.4 Verificar SSL

```bash
sudo nginx -t
sudo systemctl reload nginx

# Test
curl https://tripcalc.site
```

### 5.5 Renovación automática

Certbot instala un cron job automáticamente. Verificar:

```bash
sudo systemctl status certbot.timer
```

## Paso 6: Configurar Auto-inicio

### 6.1 Docker Compose con auto-restart

Ya está configurado en `docker-compose.prod.yml`:

```yaml
restart: unless-stopped
```

### 6.2 Verificar

```bash
# Reiniciar servidor
sudo reboot

# Después del reboot, verificar
docker ps | grep tripcalc
```

## Paso 7: Actualizar el Proyecto

### Script de actualización

Crear `deploy.sh`:

```bash
nano deploy.sh
```

Contenido:

```bash
#!/bin/bash

# TripCalc Deployment Script
set -e

echo "🚀 Deploying TripCalc..."

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Stop current container
echo "🛑 Stopping current container..."
docker-compose -f docker-compose.prod.yml down

# Rebuild image
echo "🔨 Building new image..."
docker-compose -f docker-compose.prod.yml build

# Start container
echo "▶️  Starting container..."
docker-compose -f docker-compose.prod.yml up -d

# Show logs
echo "📋 Logs:"
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "✅ Deployment complete!"
echo "🌐 Visit: https://tripcalc.site"
```

Hacer ejecutable:

```bash
chmod +x deploy.sh
```

Uso:

```bash
./deploy.sh
```

## Paso 8: Monitoreo y Mantenimiento

### 8.1 Ver logs en tiempo real

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 8.2 Ver status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 8.3 Ver recursos

```bash
docker stats tripcalc-prod
```

### 8.4 Entrar al contenedor

```bash
docker exec -it tripcalc-prod sh
```

### 8.5 Reiniciar

```bash
docker-compose -f docker-compose.prod.yml restart
```

## Paso 9: Backups (Opcional)

### 9.1 Backup de la imagen

```bash
docker save tripcalc:production | gzip > tripcalc-backup-$(date +%Y%m%d).tar.gz
```

### 9.2 Backup del código

```bash
tar -czf tripcalc-code-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  ~/apps/tripcalc
```

## Troubleshooting

### Problema: Container no inicia

```bash
# Ver logs detallados
docker logs tripcalc-prod

# Verificar que el puerto 3000 no esté en uso
sudo lsof -i :3000

# Verificar recursos del sistema
df -h
free -h
```

### Problema: Nginx no conecta al contenedor

```bash
# Verificar que el contenedor esté corriendo
docker ps | grep tripcalc

# Test de conectividad local
curl http://localhost:3000

# Ver logs de nginx
sudo tail -f /var/log/nginx/tripcalc_error.log
```

### Problema: SSL no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente si es necesario
sudo certbot renew --dry-run
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx
```

### Problema: Out of memory

```bash
# Ver uso de memoria
docker stats

# Agregar límites en docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 512M
```

### Problema: Build falla

```bash
# Limpiar cache de Docker
docker builder prune -a

# Rebuild sin cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

## Configuración Avanzada

### Multi-container con Redis (futuro)

```yaml
version: '3.8'

services:
  tripcalc:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - redis
    environment:
      REDIS_URL: redis://redis:6379

  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Configurar firewall

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Si usas puerto custom para Docker
sudo ufw allow 3000/tcp
```

### Logs rotation

Nginx logs rotation ya está configurado por defecto en `/etc/logrotate.d/nginx`.

Para Docker logs:

```bash
# Agregar a docker-compose.prod.yml
services:
  tripcalc:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Comandos Útiles

```bash
# Ver todos los containers
docker ps -a

# Limpiar containers parados
docker container prune

# Limpiar imágenes sin usar
docker image prune -a

# Ver uso de disco de Docker
docker system df

# Limpiar todo
docker system prune -a --volumes

# Exportar logs
docker logs tripcalc-prod > logs.txt 2>&1

# Verificar salud del contenedor
docker inspect --format='{{.State.Health.Status}}' tripcalc-prod
```

## Checklist de Deployment

- [ ] Git repo clonado/código subido
- [ ] .env.production configurado
- [ ] Docker image construida
- [ ] Container corriendo (puerto 3000)
- [ ] Nginx configurado
- [ ] DNS apuntando al servidor
- [ ] SSL configurado con Let's Encrypt
- [ ] HTTPS funcionando
- [ ] Auto-restart habilitado
- [ ] Script de deploy creado
- [ ] Logs monitoreándose correctamente

## Resumen de Comandos

```bash
# Deployment inicial
cd ~/apps/tripcalc
git clone [repo] .
docker-compose -f docker-compose.prod.yml up -d

# Actualización
./deploy.sh

# Monitoreo
docker-compose -f docker-compose.prod.yml logs -f

# Reinicio
docker-compose -f docker-compose.prod.yml restart
```

---

**Siguientes pasos**: Ver MAINTENANCE.md para guía de mantenimiento continuo.
