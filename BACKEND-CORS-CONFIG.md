# Configuración CORS para API Backend - Soporte Capacitor

## 🎯 Problema
La aplicación móvil construida con Capacitor falla con error "Failed to fetch" porque el backend no envía los headers CORS necesarios para permitir peticiones desde `capacitor://localhost`.

## ✅ Solución

### Para NestJS

En `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración CORS para Capacitor + Web
  app.enableCors({
    origin: [
      'capacitor://localhost',        // Capacitor iOS
      'ionic://localhost',            // Capacitor iOS alternativo
      'http://localhost',             // Capacitor Android
      'http://localhost:5173',        // Desarrollo web (Vite)
      'http://localhost:3000',        // Desarrollo web alternativo
      'https://remesas-api-dev.cootranstame.net', // Producción
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  await app.listen(3000);
}
bootstrap();
```

### Para Express.js

Instalar el paquete cors:
```bash
npm install cors
npm install -D @types/cors
```

En `src/index.ts` o `src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();

// Configuración CORS
app.use(cors({
  origin: [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://remesas-api-dev.cootranstame.net',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
// ... resto de la configuración
```

### Para FastAPI (Python)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "capacitor://localhost",
        "ionic://localhost",
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://remesas-api-dev.cootranstame.net",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)
```

## 🔍 Verificación

Después de implementar, verificar con:

```bash
# Verificar preflight (OPTIONS)
curl -X OPTIONS https://remesas-api-dev.cootranstame.net/auth/login \
  -H "Origin: capacitor://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Debe retornar:**
```
Access-Control-Allow-Origin: capacitor://localhost
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

## 📱 Orígenes por Plataforma

- **Android (Capacitor)**: `http://localhost`
- **iOS (Capacitor)**: `capacitor://localhost` o `ionic://localhost`
- **Web desarrollo**: `http://localhost:5173` (Vite), `http://localhost:3000` (otros)
- **Web producción**: Tu dominio específico

## ⚠️ Importante para Producción

Para producción, NO uses `*` (wildcard). Especifica SOLO los orígenes necesarios:

```typescript
origin: process.env.NODE_ENV === 'production' 
  ? [
      'capacitor://localhost',
      'ionic://localhost', 
      'http://localhost',
      'https://tu-dominio-produccion.com'
    ]
  : true  // En desarrollo permite todos
```

## 🚀 Próximos Pasos

1. Implementar la configuración CORS en el backend
2. Reiniciar el servidor
3. Verificar con curl que los headers se envíen correctamente
4. Probar la app móvil - el login debería funcionar
