# Frontend Dockerfile — Expo web export (for CI/CD preview)
# For mobile builds, use EAS Build (eas build --platform android/ios)

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variables for the build
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_CHATBOT_URL
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL:-http://localhost:5058}
ENV EXPO_PUBLIC_CHATBOT_URL=${EXPO_PUBLIC_CHATBOT_URL:-http://localhost:8000}

# Export as static web app
RUN npx expo export --platform web 2>/dev/null || echo "Web export skipped (mobile-only project)"

# ── Serve with nginx ──
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://nt118-backend:5058; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
