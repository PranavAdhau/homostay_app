# Hostinger VPS Manual Deployment Runbook

This runbook is for the Ubuntu 24.04 Hostinger VPS at `82.25.105.149`.
Use `/var/www/homostay_app` only.

## First Server Setup

```bash
ssh root@82.25.105.149
lsb_release -a
whoami
apt update
apt upgrade -y
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

```bash
apt install -y autoconf bison build-essential ca-certificates curl fail2ban git gnupg libffi-dev libgdbm-dev libncurses5-dev libpq-dev libreadline-dev libssl-dev libvips libyaml-dev logrotate nginx pkg-config postgresql postgresql-client postgresql-contrib redis-server ufw unattended-upgrades zlib1g-dev
```

```bash
ufw allow OpenSSH
ufw allow 'Nginx HTTP'
ufw --force enable
systemctl enable fail2ban
systemctl start fail2ban
dpkg-reconfigure --priority=low unattended-upgrades
```

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
free -h
```

## Runtime Install As deploy

```bash
su - deploy
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init - bash)"' >> ~/.bashrc
exec bash
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
rbenv install -s 3.3.10
rbenv global 3.3.10
gem install bundler -v 2.7.2
```

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 20.19.0
nvm alias default 20.19.0
nvm use 20.19.0
```

## Database

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo -u postgres psql
```

```sql
CREATE USER homostay_app WITH PASSWORD 'CHANGE_THIS_DATABASE_PASSWORD';
CREATE DATABASE homostay_app_production OWNER homostay_app;
\q
```

## Clone And Configure App

```bash
ssh-keygen -t ed25519 -C "deploy@82.25.105.149"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone git@github.com:PranavAdhau/homostay_app.git homostay_app
cd /var/www/homostay_app
```

```bash
cd /var/www/homostay_app/server
bundle _2.7.2_ config set deployment true
bundle _2.7.2_ config set without 'development test'
bundle _2.7.2_ install
bundle exec rails secret
```

Create `/etc/homostay_app.env` from `deploy/hostinger/homostay_app.env.example`, then paste the generated secret.

```bash
sudo install -o root -g deploy -m 0640 /dev/null /etc/homostay_app.env
sudo nano /etc/homostay_app.env
```

```bash
cd /var/www/homostay_app/client
npm ci
```

## First App Setup

```bash
cd /var/www/homostay_app/server
set -a
. /etc/homostay_app.env
set +a
bundle exec rails db:prepare
```

Only if sample/admin seed data is wanted:

```bash
bundle exec rails db:seed
```

```bash
cd /var/www/homostay_app/client
set -a
. /etc/homostay_app.env
set +a
VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build:production
cd /var/www/homostay_app
./scripts/publish_frontend.sh production
```

This repo does not currently expose Rails asset pipeline tasks; the production asset step is the Vite build plus `scripts/publish_frontend.sh`.

## Install Services And Nginx Config

```bash
sudo cp /var/www/homostay_app/deploy/hostinger/homostay_app_puma.service /etc/systemd/system/homostay_app_puma.service
sudo cp /var/www/homostay_app/deploy/hostinger/homostay_app_sidekiq.service /etc/systemd/system/homostay_app_sidekiq.service
sudo cp /var/www/homostay_app/deploy/hostinger/nginx_homostay_app.conf /etc/nginx/sites-available/homostay_app
sudo ln -sf /etc/nginx/sites-available/homostay_app /etc/nginx/sites-enabled/homostay_app
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

## First Boot

```bash
sudo systemctl daemon-reload
sudo systemctl enable homostay_app_puma
sudo systemctl start homostay_app_puma
sudo systemctl enable homostay_app_sidekiq
sudo systemctl start homostay_app_sidekiq
sudo systemctl reload nginx
```

```bash
sudo systemctl status homostay_app_puma --no-pager
sudo systemctl status homostay_app_sidekiq --no-pager
ls -lah /var/www/homostay_app/server/tmp/sockets/
curl -i http://82.25.105.149/up
```

## Normal Deploy

Never run `db:seed` in normal deploys.

```bash
su - deploy
cd /var/www/homostay_app
git pull --ff-only origin main
cd server
bundle _2.7.2_ install
cd ../client
npm ci
set -a
. /etc/homostay_app.env
set +a
VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build:production
cd /var/www/homostay_app
./scripts/publish_frontend.sh production
cd server
bundle exec rails db:migrate
sudo systemctl restart homostay_app_puma
sudo systemctl restart homostay_app_sidekiq
sudo nginx -t
sudo systemctl reload nginx
curl -i http://82.25.105.149/up
```

## Backups

```bash
sudo mkdir -p /var/backups/homostay_app/postgres
sudo chown postgres:postgres /var/backups/homostay_app/postgres
sudo chmod 0750 /var/backups/homostay_app/postgres
sudo cp /var/www/homostay_app/deploy/hostinger/backup_homostay_postgres.sh /usr/local/bin/backup_homostay_postgres.sh
sudo chmod 0750 /usr/local/bin/backup_homostay_postgres.sh
sudo /usr/local/bin/backup_homostay_postgres.sh
```

Add to root crontab with `sudo crontab -e`:

```cron
15 2 * * * /usr/local/bin/backup_homostay_postgres.sh >> /var/log/homostay_postgres_backup.log 2>&1
```

Restore:

```bash
sudo systemctl stop homostay_app_sidekiq
sudo systemctl stop homostay_app_puma
gunzip -c /var/backups/homostay_app/postgres/homostay_app_production_YYYYMMDD_HHMMSS.sql.gz | sudo -u postgres psql homostay_app_production
sudo systemctl start homostay_app_puma
sudo systemctl start homostay_app_sidekiq
```

## Domain Migration

Set DNS:

```text
A @ 82.25.105.149
A www 82.25.105.149
```

Update `/etc/homostay_app.env`:

```env
APP_HOSTS=YOUR_DOMAIN.com,www.YOUR_DOMAIN.com,82.25.105.149
RAILS_FORCE_SSL=true
BACKEND_URL=https://YOUR_DOMAIN.com
FRONTEND_URL=https://YOUR_DOMAIN.com
VITE_API_BASE_URL=https://YOUR_DOMAIN.com
ICAL_DOMAIN=YOUR_DOMAIN.com
```

Rebuild frontend and install SSL:

```bash
cd /var/www/homostay_app/client
set -a
. /etc/homostay_app.env
set +a
VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build:production
cd /var/www/homostay_app
./scripts/publish_frontend.sh production
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com -m admin@YOUR_DOMAIN.com --agree-tos --redirect
sudo ufw allow 'Nginx Full'
sudo systemctl restart homostay_app_puma
sudo systemctl restart homostay_app_sidekiq
sudo nginx -t
sudo systemctl reload nginx
curl -I https://YOUR_DOMAIN.com/up
```
