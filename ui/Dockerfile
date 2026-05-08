# syntax=docker/dockerfile:1.6
# ----- Build stage -----
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar deps con cache eficiente
COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Build
COPY . .
ARG VITE_MAPBOX_TOKEN
ENV VITE_MAPBOX_TOKEN=${VITE_MAPBOX_TOKEN}
RUN npm run build

# ----- Runtime stage -----
FROM nginx:1.27-alpine AS runtime

# Config nginx mínima: SPA fallback + proxy a /v1, /v2, /health, /ws
RUN <<'NGINX_CONF' tee /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # API REST
    location /v1/ { proxy_pass http://backend:8000/v1/; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
    location /v2/ { proxy_pass http://backend:8000/v2/; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
    location /health { proxy_pass http://backend:8000/health; }

    # WebSocket
    location /ws {
        proxy_pass http://backend:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }

    # SPA fallback
    location / { try_files $uri $uri/ /index.html; }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_CONF

# Quitar config default de nginx
RUN rm -f /etc/nginx/conf.d/default.conf.bak

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
