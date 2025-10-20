# Etapa 1: Build
FROM node:20-slim AS builder

# Argumentos de build
ARG NODE_ENV=production
ARG VITE_API_URL=localhost

WORKDIR /app

# Instalar dependencias para compilación en Raspberry Pi
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalación optimizada para Raspberry Pi
# Instalar todas las dependencias incluyendo devDependencies para el build
RUN npm install && \
    npm install @rollup/rollup-linux-arm64-gnu --save-dev

# Copiamos código fuente
COPY . .

# Configurar variables de entorno para el build
ENV NODE_ENV=$NODE_ENV
ENV VITE_API_URL=$VITE_API_URL

# Build de producción
RUN npm run build

# Etapa 2: Servir archivos estáticos con imagen compatible con ARM
FROM nginx:stable-alpine

# Copiamos archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]