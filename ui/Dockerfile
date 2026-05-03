FROM node:20-alpine as builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json .
COPY tsconfig*.json .

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build para producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar build desde builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración Nginx
COPY ../infra/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
