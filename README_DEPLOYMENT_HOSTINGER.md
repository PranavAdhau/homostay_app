# Hostinger Deployment Guide

This guide matches the current repository structure:

- React + Vite frontend in `client/`
- Rails app in `server/`
- published frontend copied into `server/public/`
- Puma + Nginx deployment

## 1. Versions Confirmed From The Repo

- Ruby: `3.3.10`
  - from `server/.ruby-version`
- Bundler: `2.7.2`
  - from `server/Gemfile.lock`
- Rails: `7.2.3`
  - from `server/Gemfile.lock`
- PostgreSQL adapter: `pg`
  - from `server/Gemfile`
- Redis:
  - present in `server/Gemfile`
  - used by production Action Cable in `server/config/cable.yml`
- Vite: `6.4.1`
  - from `client/package.json`
- `@vitejs/plugin-react`: `5.1.4`
  - from `client/package.json`

### Node.js requirement

The repo does not pin Node with `.nvmrc` or an `engines` field.

What the lockfile confirms:

- `vite@6.4.1` supports `^18.0.0 || ^20.0.0 || >=22.0.0`
- `@vitejs/plugin-react@5.1.4` requires `^20.19.0 || >=22.12.0`

Safe repo-based deployment choice:

- Node `20.19.0`

## 2. Current Production Architecture

In this repo, production is not "client static site + separate Rails API" deployment.

Actual flow:

1. Build the frontend in `client/`
2. Publish the build into `server/public/`
3. Run Rails from `server/`
4. Let Nginx serve static files from `server/public/` and proxy everything else to Puma

Important repo details:

- Vite output directory is `client/build`, not `client/dist`
- compiled bundles go into `client/build/vite`
- `scripts/publish_frontend.sh` copies the build into `server/public`
- outside development, Rails serves `server/public/index.html`
- Rails routes `/vite/*` and `/assets/*` explicitly in non-development environments

## 3. Prepare The VPS

Hostinger VPS assumptions:

- Ubuntu-based VPS
- SSH access
- sudo access
- domain already pointing to the VPS

SSH in:

```bash
ssh root@YOUR_VPS_IP
```

Create a deploy user if needed:

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

## 4. Install System Packages

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  curl \
  git \
  libpq-dev \
  libssl-dev \
  libreadline-dev \
  libvips \
  nginx \
  postgresql \
  postgresql-client \
  postgresql-contrib \
  redis-server \
  zlib1g-dev
```

Why these are needed by this repo:

- `pg` gem needs PostgreSQL libraries
- `image_processing` uses `libvips`
- Nginx, PostgreSQL, and Redis are referenced by the deployment/config files

## 5. Install Ruby And Bundler

Using `rbenv`:

```bash
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init - bash)"' >> ~/.bashrc
exec $SHELL

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

Clone the repo before installing the exact Ruby:

```bash
cd /var/www
git clone YOUR_REPO_URL homostay_app
cd /var/www/homostay_app
```

Install the repo-pinned Ruby and Bundler:

```bash
rbenv install -s "$(cat server/.ruby-version)"
rbenv global "$(cat server/.ruby-version)"
gem install bundler -v 2.7.2
```

## 6. Install Node

One repo-compatible option with `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 20.19.0
nvm use 20.19.0
```

## 7. Configure PostgreSQL

The production database config in `server/config/database.yml` expects:

- database: `homostay_app_production`
- username: `homostay_app`
- password from `HOMOSTAY_APP_DATABASE_PASSWORD`

Create them:

```bash
sudo -u postgres psql
```

```sql
CREATE USER homostay_app WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE homostay_app_production OWNER homostay_app;
\q
```

## 8. Install App Dependencies

Backend:

```bash
cd /var/www/homostay_app/server
bundle _2.7.2_ install
```

Frontend:

```bash
cd /var/www/homostay_app/client
npm install
```

## 9. Set Production Environment Variables

### Important

`dotenv-rails` is only included for `development, test` in this repo.

That means `server/.env.production` is a reference file, but Rails production will not auto-load it.

For Hostinger/VPS deployment, set production vars in the real process environment. A simple pattern is an environment file such as:

- `/etc/homostay_app.env`

Example:

```bash
sudo tee /etc/homostay_app.env >/dev/null <<'EOF'
RAILS_ENV=production
BACKEND_URL=https://your-real-domain.com
FRONTEND_URL=https://your-real-domain.com
HOMOSTAY_APP_DATABASE_PASSWORD=CHANGE_THIS_PASSWORD
RAILS_LOG_LEVEL=info
RAILS_SERVE_STATIC_FILES=1
REDIS_URL=redis://localhost:6379/0
EOF
```

Client-side production env is build-time only. Before building the frontend, update:

- `client/.env.production`

Set:

```env
VITE_API_BASE_URL=https://your-real-domain.com
```

### Variables detected from the repo

Required for normal production boot:

- `BACKEND_URL`
- `FRONTEND_URL`
- `HOMOSTAY_APP_DATABASE_PASSWORD`

Used by runtime/config if you want to set them:

- `REDIS_URL`
- `RAILS_LOG_LEVEL`
- `RAILS_SERVE_STATIC_FILES`
- `RAILS_MAX_THREADS`
- `RAILS_MIN_THREADS`
- `WEB_CONCURRENCY`
- `PORT`
- `PIDFILE`
- `ICAL_DOMAIN`

Used by optional booking notifications/seeding:

- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `ADMIN_WHATSAPP_NUMBER`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Notes:

- production Action Cable defaults to `redis://localhost:6379/1` if `REDIS_URL` is not set
- the sample Sidekiq service file uses `redis://localhost:6379/0`
- setting `REDIS_URL` explicitly keeps both consistent

## 10. Build And Publish The Frontend

From the repo root:

```bash
cd /var/www/homostay_app
./scripts/publish_frontend.sh production
```

What this script actually does:

- runs the frontend production build
- removes old `server/public/index.html`
- removes old `server/public/assets`
- removes old `server/public/vite`
- copies the new `client/build/*` contents into `server/public/`

There is also a root convenience script:

```bash
cd /var/www/homostay_app
npm run publish:frontend
```

## 11. Prepare Rails For Production

```bash
cd /var/www/homostay_app/server
set -a
source /etc/homostay_app.env
set +a
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails assets:precompile
```

Notes:

- `assets:precompile` is still part of the repo's production flow
- Rails serves static files from `server/public/`
- Active Storage is configured for local disk storage in production

## 12. Configure Puma

The repo already includes `server/config/puma.rb`.

Important production behavior from that file:

- Puma binds to a Unix socket at `server/tmp/sockets/puma.sock`
- default TCP port is `3000`
- workers depend on `WEB_CONCURRENCY`

Create a systemd service:

```bash
sudo tee /etc/systemd/system/homostay_app_puma.service >/dev/null <<'EOF'
[Unit]
Description=Homestay App Puma
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/homostay_app/server
EnvironmentFile=/etc/homostay_app.env
ExecStart=/home/deploy/.rbenv/shims/bundle exec puma -C config/puma.rb
ExecReload=/bin/kill -USR1 $MAINPID
KillMode=mixed
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
EOF
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable homostay_app_puma
sudo systemctl start homostay_app_puma
sudo systemctl status homostay_app_puma
```

## 13. Configure Sidekiq

This repo includes:

- Sidekiq gem
- `/sidekiq` route mount
- `server/config/systemd/sidekiq.service.example`

If you want Sidekiq running on the VPS:

```bash
sudo tee /etc/systemd/system/homostay_app_sidekiq.service >/dev/null <<'EOF'
[Unit]
Description=Homestay App Sidekiq
After=network.target redis.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/homostay_app/server
EnvironmentFile=/etc/homostay_app.env
ExecStart=/home/deploy/.rbenv/shims/bundle exec sidekiq -e production
ExecReload=/bin/kill -TSTP $MAINPID
KillMode=mixed
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
EOF
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable homostay_app_sidekiq
sudo systemctl start homostay_app_sidekiq
sudo systemctl status homostay_app_sidekiq
```

## 14. Configure Nginx

Use `server/config/nginx.conf.example` as the base shape, but update the paths so they point at the actual Rails app under `server/`.

Create:

```bash
sudo tee /etc/nginx/sites-available/homostay_app >/dev/null <<'EOF'
upstream rails_app {
  server unix:///var/www/homostay_app/server/tmp/sockets/puma.sock;
}

server {
  listen 80;
  server_name your-real-domain.com www.your-real-domain.com;
  root /var/www/homostay_app/server/public;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-real-domain.com www.your-real-domain.com;

  root /var/www/homostay_app/server/public;

  ssl_certificate /etc/letsencrypt/live/your-real-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-real-domain.com/privkey.pem;

  location /vite/ {
    alias /var/www/homostay_app/server/public/vite/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  location /assets/ {
    alias /var/www/homostay_app/server/public/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  location ~ ^/(robots\.txt|favicon\.ico|apple-touch-icon.*\.png)$ {
    try_files $uri @rails;
    access_log off;
  }

  location / {
    try_files $uri @rails;
  }

  location @rails {
    proxy_pass http://rails_app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_redirect off;
  }

  location /up {
    proxy_pass http://rails_app;
    access_log off;
  }
}
EOF
```

Enable and test:

```bash
sudo ln -sf /etc/nginx/sites-available/homostay_app /etc/nginx/sites-enabled/homostay_app
sudo nginx -t
sudo systemctl reload nginx
```

## 15. SSL

Install Certbot if needed:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Issue the certificate:

```bash
sudo certbot --nginx -d your-real-domain.com -d www.your-real-domain.com
```

## 16. Verify Deployment

Useful checks:

```bash
curl -I https://your-real-domain.com/up
curl -I https://your-real-domain.com
```

Service checks:

```bash
sudo systemctl status homostay_app_puma
sudo systemctl status homostay_app_sidekiq
sudo systemctl status nginx
sudo systemctl status redis-server
```

## 17. Deploy Updates

For a normal code update:

```bash
cd /var/www/homostay_app
git pull
cd /var/www/homostay_app/server
bundle _2.7.2_ install
cd /var/www/homostay_app/client
npm install
cd /var/www/homostay_app
./scripts/publish_frontend.sh production
cd /var/www/homostay_app/server
set -a
source /etc/homostay_app.env
set +a
bundle exec rails db:migrate
bundle exec rails assets:precompile
sudo systemctl restart homostay_app_puma
sudo systemctl restart homostay_app_sidekiq
sudo systemctl reload nginx
```

## 18. Summary Of Repo-Specific Corrections

This file has been aligned to the current codebase:

- frontend build output is `client/build`, not `client/dist`
- production publish target is `server/public`, not the client folder
- Nginx root must point to `server/public`
- Puma socket lives under `server/tmp/sockets/puma.sock`
- Rails production does not auto-load `server/.env.production` in the current Gemfile
