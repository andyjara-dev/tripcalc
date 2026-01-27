# ✅ Docker Setup Complete

TripCalc está completamente configurado para desarrollo y despliegue con Docker.

## 🎯 Lo que se ha configurado

### Archivos Docker

- ✅ **Dockerfile** - Build multi-stage optimizado (~292MB)
- ✅ **.dockerignore** - Excluye archivos innecesarios
- ✅ **docker-compose.yml** - Desarrollo y producción
- ✅ **docker-compose.prod.yml** - Configuración específica para producción
- ✅ **.env.production.example** - Variables de entorno de ejemplo

### Scripts npm

```json
"docker:build": "docker build -t tripcalc:latest .",
"docker:run": "docker run -p 3000:3000 --name tripcalc tripcalc:latest",
"docker:stop": "docker stop tripcalc && docker rm tripcalc",
"docker:up": "docker-compose up -d",
"docker:down": "docker-compose down",
"docker:dev": "docker-compose --profile dev up tripcalc-dev",
"docker:logs": "docker-compose logs -f"
```

### Next.js Config

- ✅ **output: 'standalone'** configurado en next.config.ts
- ✅ Optimizado para Docker deployment

## 🚀 Uso Rápido

### Desarrollo Local con Docker

```bash
# Iniciar
npm run docker:up

# Ver logs
npm run docker:logs

# Detener
npm run docker:down
```

### Build y Deploy Manual

```bash
# Build de la imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run

# Detener contenedor
npm run docker:stop
```

### Desarrollo con Hot Reload

```bash
# Iniciar en modo desarrollo
npm run docker:dev
```

## 📊 Características Docker

### Multi-Stage Build

1. **Stage 1 (deps)**: Instala dependencias
2. **Stage 2 (builder)**: Build de la aplicación
3. **Stage 3 (runner)**: Imagen final optimizada

### Seguridad

- ✅ Usuario no-root (nextjs:nodejs)
- ✅ Imagen Alpine Linux (mínima superficie de ataque)
- ✅ Solo archivos necesarios en imagen final

### Optimización

- ✅ ~292MB imagen final
- ✅ Standalone output (solo archivos necesarios)
- ✅ Cache de capas de Docker
- ✅ .dockerignore configurado

## 🌐 Opciones de Deployment

### 1. Vercel (Más Fácil - Free)

```bash
vercel
```

### 2. Docker en VPS ($5-10/mes)

```bash
# En tu VPS
git clone https://github.com/yourusername/tripcalc.git
cd tripcalc
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Google Cloud Run

```bash
gcloud run deploy tripcalc --source . --platform managed
```

### 4. AWS ECS/Fargate

```bash
# Push a ECR
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ECR_URL
docker tag tripcalc:latest YOUR_ECR_URL/tripcalc:latest
docker push YOUR_ECR_URL/tripcalc:latest
```

### 5. Azure Container Instances

```bash
az container create --resource-group rg --name tripcalc --image tripcalc:latest
```

### 6. DigitalOcean App Platform

```bash
doctl apps create --spec .do/app.yaml
```

## 🧪 Testing Docker Build

Ejecuta el script de prueba:

```bash
./scripts/test-docker.sh
```

O manualmente:

```bash
# Build
docker build -t tripcalc:test .

# Run
docker run -d -p 3000:3000 --name test tripcalc:test

# Test
curl http://localhost:3000

# Cleanup
docker stop test && docker rm test
```

## 📝 Variables de Entorno

Crea `.env.production` para producción:

```env
NEXT_PUBLIC_SITE_URL=https://tripcalc.site
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔧 Troubleshooting

### Ver logs del contenedor

```bash
docker logs tripcalc
# O con docker-compose
docker-compose logs -f
```

### Rebuild sin cache

```bash
docker build --no-cache -t tripcalc:latest .
```

### Entrar al contenedor

```bash
docker exec -it tripcalc sh
```

### Verificar salud del contenedor

```bash
docker ps
docker inspect tripcalc
```

## 📚 Documentación Completa

- **DOCKER.md** - Guía completa de Docker
- **README.md** - Documentación general del proyecto
- **claude.md** - Documentación técnica detallada
- **GETTING_STARTED.md** - Guía de inicio rápido

## ✨ Próximos Pasos

1. **Desarrollo**: Agregar calculadoras y más ciudades
2. **Deploy**: Elegir plataforma (Vercel gratis o VPS con Docker)
3. **CI/CD**: Configurar GitHub Actions para builds automáticos
4. **Monitoring**: Agregar health checks y logging
5. **Scaling**: Cuando sea necesario, migrar a Kubernetes

---

**Estado**: ✅ Listo para desarrollo y producción

**Build verificado**: ✅ Imagen construida exitosamente

**Tamaño**: ~292MB (optimizado)

**Última actualización**: 2026-01-27
