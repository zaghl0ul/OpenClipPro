# OpenClip Pro Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env` and fill all required values
- [ ] Generate a secure 32+ character encryption key for `VITE_ENCRYPTION_KEY`
- [ ] Set up Firebase project and obtain credentials
- [ ] Configure monitoring endpoints (Sentry, LogRocket, etc.)
- [ ] Set appropriate rate limits for your infrastructure

### 2. Security Audit
- [ ] Ensure all API keys are properly encrypted
- [ ] Verify CSP headers in `nginx.conf` or hosting configuration
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure CORS policies appropriately
- [ ] Review and test authentication flows
- [ ] Implement proper session management
- [ ] Enable security headers (HSTS, X-Frame-Options, etc.)

### 3. Performance Optimization
- [ ] Enable gzip/brotli compression
- [ ] Configure CDN for static assets
- [ ] Set up proper caching headers
- [ ] Optimize bundle sizes with code splitting
- [ ] Enable service worker for offline support
- [ ] Configure lazy loading for routes and components

### 4. Database Configuration
- [ ] Set up Firebase Security Rules
- [ ] Configure Firestore indexes
- [ ] Enable automated backups
- [ ] Set up data retention policies
- [ ] Configure read/write limits

## Deployment Options

### Option 1: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Build for production
npm run build:prod

# Deploy to Firebase
firebase deploy --only hosting
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t openclip-pro:latest .

# Run with environment variables
docker run -d \
  --name openclip-pro \
  -p 80:80 \
  -p 443:443 \
  --env-file .env.production \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  openclip-pro:latest

# Or use Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Traditional VPS/Cloud Deployment

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name openclip.pro www.openclip.pro;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name openclip.pro www.openclip.pro;
    
    ssl_certificate /etc/letsencrypt/live/openclip.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/openclip.pro/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebase.com wss://*.firebaseio.com https://*.anthropic.com https://*.openai.com;" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    root /var/www/openclip-pro/dist;
    index index.html;
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### PM2 Process Management (if using Node.js backend)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Post-Deployment Tasks

### 1. Monitoring Setup
- [ ] Configure Google Analytics 4
- [ ] Set up error tracking (Sentry)
- [ ] Enable performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up alerts for critical errors

### 2. Backup Strategy
- [ ] Automated daily Firestore backups
- [ ] User-uploaded content backup to cloud storage
- [ ] Configuration backup (non-sensitive)
- [ ] Disaster recovery plan documentation

### 3. Scaling Considerations
- [ ] Configure auto-scaling rules
- [ ] Set up load balancing if needed
- [ ] Optimize database queries
- [ ] Implement caching strategy
- [ ] Monitor and optimize costs

### 4. Security Monitoring
- [ ] Set up intrusion detection
- [ ] Configure rate limiting alerts
- [ ] Monitor for suspicious activities
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

## Environment Variables for Production

```bash
# Required for production
NODE_ENV=production
VITE_FIREBASE_API_KEY=<your-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-domain>
VITE_FIREBASE_PROJECT_ID=<your-project>
VITE_FIREBASE_STORAGE_BUCKET=<your-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
VITE_ENCRYPTION_KEY=<32+ char key>

# Recommended for production
VITE_MONITORING_ENDPOINT=<your-monitoring-service>
VITE_ERROR_TRACKING_ENDPOINT=<your-error-tracking>
VITE_API_RATE_LIMIT_PER_MINUTE=60
VITE_MAX_FILE_SIZE_MB=5000
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify Firebase configuration matches your domain
   - Check CORS settings in storage bucket
   - Ensure API endpoints are whitelisted

2. **Authentication Issues**
   - Verify authorized domains in Firebase Console
   - Check redirect URIs configuration
   - Ensure cookies are enabled for session management

3. **Performance Issues**
   - Enable CDN for static assets
   - Optimize bundle sizes
   - Implement proper caching strategies
   - Use performance monitoring to identify bottlenecks

4. **Upload Failures**
   - Check file size limits
   - Verify storage bucket permissions
   - Monitor rate limiting
   - Check CORS configuration for storage

## Maintenance Schedule

- **Daily**: Monitor error logs and performance metrics
- **Weekly**: Review analytics and user feedback
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Full security audit and performance review

## Support

For deployment support, contact: support@openclip.pro

## License

See LICENSE file for details.