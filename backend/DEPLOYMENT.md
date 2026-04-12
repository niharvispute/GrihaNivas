# Backend Production Deployment Guide

This guide covers production deployment for the Bricks backend with:
- PM2 cluster mode
- Nginx reverse proxy
- HTTPS (Let's Encrypt)
- Redis-backed JWT refresh token blacklist

## 1. Prerequisites

- Ubuntu 22.04+ (or equivalent Linux host)
- Node.js 20+
- PM2 installed globally
- Nginx installed
- Redis installed or managed Redis endpoint available
- Domain name pointed to server IP (A record)

## 2. Environment Variables

Set these variables in production `.env`:

- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `JWT_BLACKLIST_STORE=redis`
- `REDIS_URL=redis://127.0.0.1:6379`
- `TRUST_PROXY=true`
- `FORCE_HTTPS=true`
- `ALLOWED_ORIGINS=https://your-frontend-domain.com`

## 3. Install & Start App with PM2

```bash
cd /var/www/bricks/backend
npm ci --legacy-peer-deps
npm run preflight:prod
npm run lint
node scripts/test-apis.js
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 4. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/bricks-backend`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/bricks-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Enable HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

Certbot will update Nginx for SSL and automatic HTTP->HTTPS redirection.

## 6. Redis Setup (Local)

```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping
```

Expected output: `PONG`

## 7. Health & Runtime Checks

```bash
curl -s https://api.yourdomain.com/health
curl -s https://api.yourdomain.com/health/ready
pm2 status
pm2 logs bricks-backend --lines 100
```

## 8. Zero-Downtime Update Flow

```bash
cd /var/www/bricks/backend
git pull
npm ci --legacy-peer-deps
npm run lint
pm2 reload bricks-backend
```

## 9. Rollback Plan

- Keep previous release checkout available.
- If deploy fails:
  1. Checkout previous commit
  2. `npm ci --legacy-peer-deps`
  3. `pm2 reload bricks-backend`

## 10. Notes

- `FORCE_HTTPS=true` in app enforces redirect safety at Node layer.
- TLS termination should still happen at Nginx/load balancer.
- Redis blacklist ensures revoked refresh tokens survive app restarts and multiple instances.
