# ── Build stage ──────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY back-office/package*.json ./
RUN npm install --ignore-scripts --legacy-peer-deps

COPY back-office/ .
RUN npx ng build --configuration=production --output-hashing=all

# ── Runtime stage ────────────────────────────
FROM nginx:1.25-alpine

RUN apk add --no-cache curl openssl && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/tfm-selfsigned.key \
    -out /etc/nginx/certs/tfm-selfsigned.crt \
    -subj "/CN=tfm.nbpdev.es" 2>/dev/null

COPY --from=build /app/dist/back-office/ /usr/share/nginx/html/
COPY back-office/nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod 644 /etc/nginx/certs/* && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    chown -R appuser:appgroup /etc/nginx/certs && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
