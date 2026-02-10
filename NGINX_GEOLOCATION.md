# Configuración de Nginx para Geolocalización

Para que las estadísticas de países funcionen correctamente en tu VPS con Docker, necesitas configurar nginx para pasar los headers de IP correctamente.

## Configuración de Nginx (Reverse Proxy)

Si estás usando nginx como reverse proxy delante de tu contenedor Docker, agrega estas líneas a tu configuración:

```nginx
server {
    listen 80;
    server_name tripcalc.site;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # IMPORTANTE: Headers de IP para geolocalización
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Verificar que los headers se están pasando

Puedes verificar que los headers están llegando correctamente agregando un log temporal en tu código:

```typescript
// En /app/api/analytics/track/route.ts
console.log('Headers:', {
  'x-forwarded-for': request.headers.get('x-forwarded-for'),
  'x-real-ip': request.headers.get('x-real-ip'),
});
```

## Alternativa: GeoIP Module de Nginx

Si quieres mayor rendimiento, puedes usar el módulo GeoIP de nginx:

```bash
# Instalar módulo
sudo apt-get install nginx-module-geoip libgeoip1 geoip-database

# Descargar base de datos GeoIP
sudo mkdir -p /usr/share/GeoIP
cd /usr/share/GeoIP
sudo wget https://git.io/GeoLite2-Country.mmdb.gz
sudo gunzip GeoLite2-Country.mmdb.gz
```

```nginx
# En nginx.conf
http {
    geoip_country /usr/share/GeoIP/GeoLite2-Country.mmdb;

    server {
        location / {
            proxy_set_header X-Country-Code $geoip_country_code;
            proxy_set_header X-Country-Name $geoip_country_name;
            # ... resto de la configuración
        }
    }
}
```

Luego actualiza `lib/analytics/geolocation.ts` para leer estos headers:

```typescript
const country = headers.get('x-country-code')
  || headers.get('x-vercel-ip-country')
  || undefined;
```

## Limitaciones de la API ipapi.co

La API gratuita de ipapi.co tiene límites:
- **30,000 requests/mes** (gratis)
- **1,000 requests/día**

Si excedes estos límites, considera:
1. Usar el módulo GeoIP de nginx (recomendado para producción)
2. Implementar tu propia base de datos GeoIP con MaxMind
3. Actualizar a un plan pago de ipapi.co

## Caché de Geolocalización

El código actual cachea las respuestas de ipapi.co por 24 horas para reducir el uso de la API.

## Para Docker Compose

Si usas Docker Compose, asegúrate de que tu configuración permite el paso de headers:

```yaml
services:
  tripcalc:
    image: tripcalc:latest
    ports:
      - "3000:3000"
    environment:
      - TRUST_PROXY=true  # Confiar en headers de proxy
```

Y en tu código de Next.js, puedes habilitar el trust proxy en `next.config.js`:

```javascript
module.exports = {
  // ... otras configuraciones
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
    ];
  },
};
```
