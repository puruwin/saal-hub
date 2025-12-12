# Etapa 1: Build
FROM node:20-slim AS builder

# Argumentos de build
ARG VITE_API_URL=localhost

WORKDIR /app

# Instalar dependencias para compilación en Raspberry Pi
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiamos archivos de dependencias Y package-lock
COPY package*.json ./

# IMPORTANTE: Instalar TODAS las dependencias (dev + prod) necesarias para el build
# No usar NODE_ENV=production durante npm ci porque omite devDependencies
RUN NODE_ENV=development npm ci

# Copiamos código fuente
COPY . .

# Usar configuración de producción
RUN mv vite.config.production.ts vite.config.ts

# Configurar variables de entorno para el build
ENV NODE_ENV=production
ENV VITE_API_URL=$VITE_API_URL

# Build de producción con vite directamente
RUN ./node_modules/.bin/vite build

# Etapa 2: Servir archivos estáticos con imagen compatible con ARM
FROM nginx:stable-alpine

# Copiamos archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]