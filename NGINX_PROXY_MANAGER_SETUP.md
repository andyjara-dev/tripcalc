# Configuración de Nginx Proxy Manager con TripCalc

## 🔍 Identificar tu configuración

Primero, verifica cómo está configurado tu Nginx Proxy Manager:

```bash
# Ver contenedores de Docker corriendo
docker ps | grep nginx

# Ver redes de Docker
docker network ls | grep npm
```

---

## 📌 Escenario 1: NPM en Docker + TripCalc en Docker (RECOMENDADO)

Si ambos están en Docker, deben estar en la misma red.

### 1.1 Verificar la red de NPM

```bash
# Ver en qué red está NPM
docker inspect <nombre-contenedor-npm> | grep NetworkMode

# Listar redes de NPM
docker network ls | grep npm
```

Usualmente la red se llama: `npm_default` o `nginxproxymanager_default`

### 1.2 Conectar TripCalc a la red de NPM

**Opción A: Editar docker-compose.yml**

```yaml
services:
  tripcalc:
    # ... resto de configuración
    networks:
      - npm-network

networks:
  npm-network:
    external: true
    name: npm_default  # ← Cambia esto al nombre de tu red NPM
```

**Opción B: Conectar manualmente**

```bash
# Conectar contenedor a la red de NPM
docker network connect npm_default tripcalc
```

### 1.3 Configurar el Proxy Host en NPM

En la interfaz de NPM:

**Details:**
- **Scheme:** `http`
- **Forward Hostname/IP:** `tripcalc` (nombre del contenedor)
- **Forward Port:** `3000`
- ✅ Block Common Exploits
- ✅ Websockets Support

**Advanced Tab:**
```nginx
# Headers para geolocalización
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# Headers estándar
proxy_set_header Host $host;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## 📌 Escenario 2: NPM en host + TripCalc en Docker

Si NPM está instalado directamente en el VPS (no en Docker):

### 2.1 Usar localhost en NPM

**Forward Hostname/IP:** `localhost` o `127.0.0.1`
**Forward Port:** `3000`

### 2.2 Verificar que el puerto está accesible

```bash
# Desde el host, verificar que el puerto responde
curl http://localhost:3000

# Si no responde, verifica que el puerto está expuesto
docker port tripcalc
```

### 2.3 Configuración en docker-compose.yml

No necesitas redes especiales, solo:

```yaml
services:
  tripcalc:
    ports:
      - "3000:3000"  # ← Importante: esto expone el puerto al host
    dns:
      - 8.8.8.8
      - 8.8.4.4
```

---

## 📌 Escenario 3: NPM como contenedor standalone

Si NPM está en un contenedor pero no usa docker-compose:

### 3.1 Crear una red compartida

```bash
# Crear red
docker network create npm-shared

# Conectar NPM a la red
docker network connect npm-shared <contenedor-npm>

# Conectar TripCalc a la red
docker network connect npm-shared tripcalc
```

### 3.2 Usar nombre del contenedor en NPM

**Forward Hostname/IP:** `tripcalc`
**Forward Port:** `3000`

---

## ✅ Verificación final

### Test 1: Verificar que NPM puede alcanzar TripCalc

```bash
# Desde el contenedor de NPM
docker exec <contenedor-npm> ping tripcalc

# O probar el puerto
docker exec <contenedor-npm> wget -O- http://tripcalc:3000
```

### Test 2: Verificar headers en los logs

```bash
# Ver logs de TripCalc en tiempo real
docker logs -f tripcalc | grep -i "x-forwarded"
```

Visita tu sitio y deberías ver logs con los headers.

### Test 3: Verificar geolocalización

1. Ve a: https://tripcalc.site/admin/analytics
2. Navega por el sitio
3. Verifica que aparezcan países en "Top Countries"

---

## 🚨 Solución de problemas comunes

### Problema: NPM no puede conectar a TripCalc

**Error:** `502 Bad Gateway` o `Connection refused`

**Solución:**

1. Verificar que ambos están en la misma red:
```bash
docker inspect tripcalc | grep NetworkMode
docker inspect <npm-contenedor> | grep NetworkMode
```

2. Si están en redes diferentes, conectar:
```bash
docker network connect <red-npm> tripcalc
```

### Problema: Headers no llegan a TripCalc

**Síntomas:** No aparecen países en analytics

**Solución:**

1. Verificar configuración en NPM (tab Advanced)
2. Agregar logs temporales en el código:
```typescript
// En /app/api/analytics/track/route.ts
console.log('Headers:', Object.fromEntries(request.headers));
```

3. Verificar logs:
```bash
docker logs tripcalc | grep Headers
```

### Problema: TripCalc no puede acceder a APIs externas

**Síntomas:** Errores de Weather API o Geolocation

**Solución:**

1. Verificar DNS:
```bash
docker exec tripcalc nslookup api.open-meteo.com
```

2. Verificar conectividad:
```bash
docker exec tripcalc ping 8.8.8.8
docker exec tripcalc curl https://api.open-meteo.com
```

3. Si falla, agregar DNS al docker-compose.yml:
```yaml
dns:
  - 8.8.8.8
  - 8.8.4.4
```

---

## 📝 Configuración recomendada final

### docker-compose.yml
```yaml
services:
  tripcalc:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tripcalc
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SITE_URL=https://tripcalc.site
    restart: unless-stopped
    env_file:
      - .env.production
    dns:
      - 8.8.8.8
      - 8.8.4.4
    # Si NPM está en Docker, descomenta:
    # networks:
    #   - npm-network

# Si NPM está en Docker, descomenta:
# networks:
#   npm-network:
#     external: true
#     name: npm_default
```

### NPM Proxy Host - Advanced Config
```nginx
# Headers esenciales
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# WebSockets (Next.js)
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

# Timeouts (opcional pero recomendado)
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

---

## 🎯 Resumen rápido

1. ✅ Asegurar que NPM y TripCalc pueden comunicarse (misma red o puerto expuesto)
2. ✅ Configurar headers en NPM (Advanced tab)
3. ✅ Configurar DNS en docker-compose.yml
4. ✅ Reiniciar contenedor: `docker compose restart tripcalc`
5. ✅ Verificar logs: `docker logs -f tripcalc`

¿Necesitas ayuda con tu configuración específica?
