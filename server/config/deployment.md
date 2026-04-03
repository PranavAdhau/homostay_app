# Deployment Guide

## Prerequisites

1. VPS with Ubuntu 20.04+ (Hostinger recommended)
2. Domain name from Namecheap
3. SSH access to VPS

## Server Setup

### 1. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Ruby 3.3+ (using rbenv)
sudo apt install -y build-essential libssl-dev libreadline-dev zlib1g-dev libpq-dev
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash
rbenv install 3.3.0
rbenv global 3.3.0

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Database Setup

```bash
# Create PostgreSQL user and database
sudo -u postgres psql
CREATE USER homostay_app WITH PASSWORD 'your_secure_password';
CREATE DATABASE homostay_app_production OWNER homostay_app;
\q
```

### 3. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> homostay_app
sudo chown -R deploy:deploy homostay_app

# Install dependencies
cd homostay_app/server
bundle install --deployment --without development test
cd ../client
npm install
npm run build

# Copy built frontend
rm -rf ../server/public/assets
mkdir -p ../server/public/assets
cp build/index.html ../server/public/index.html
cp -r build/assets/. ../server/public/assets/

# Set up Rails
cd ../server
RAILS_ENV=production bundle exec rails db:create
RAILS_ENV=production bundle exec rails db:migrate
RAILS_ENV=production bundle exec rails assets:precompile

# Set up environment variables
# Create .env file or use Rails credentials
```

### 4. Configure Nginx

```bash
# Copy nginx config
sudo cp config/nginx.conf.example /etc/nginx/sites-available/homostay_app
sudo ln -s /etc/nginx/sites-available/homostay_app /etc/nginx/sites-enabled/

# Edit config with your domain
sudo nano /etc/nginx/sites-available/homostay_app

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Set Up SSL

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-real-domain.com -d www.your-real-domain.com

# Auto-renewal is set up automatically
```

### 6. Configure Systemd Services

```bash
# Copy service files
sudo cp config/systemd/puma.service.example /etc/systemd/system/puma.service
sudo cp config/systemd/sidekiq.service.example /etc/systemd/system/sidekiq.service

# Edit service files with correct paths
sudo nano /etc/systemd/system/puma.service
sudo nano /etc/systemd/system/sidekiq.service

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable puma sidekiq
sudo systemctl start puma sidekiq
```

### 7. Domain DNS Configuration

In Namecheap DNS settings:
- A Record: `@` → VPS IP address
- CNAME Record: `www` → `your-real-domain.com`

## Environment Variables

Create `/var/www/homostay_app/server/.env` or use Rails credentials:

```bash
RAILS_ENV=production
DATABASE_URL=postgresql://homostay_app:password@localhost/homostay_app_production
REDIS_URL=redis://localhost:6379/0
RAILS_MASTER_KEY=<your_master_key>
SECRET_KEY_BASE=<your_secret_key_base>
```

## Deployment Checklist

- [ ] Server software installed
- [ ] Database created and migrated
- [ ] Frontend built and assets copied
- [ ] Nginx configured and tested
- [ ] SSL certificate obtained
- [ ] Systemd services configured and running
- [ ] Domain DNS configured
- [ ] Environment variables set
- [ ] Admin user created in database
- [ ] Test booking flow end-to-end
