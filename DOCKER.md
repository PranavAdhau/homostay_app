# Docker

Reference commands:
- `bash scripts/docker-build.sh`
- `bash scripts/docker-up.sh`
- `bash scripts/docker-down.sh`
- `bash scripts/docker-logs.sh`
- `bash scripts/docker-rails-console.sh`
- `bash scripts/docker-db-setup.sh`

Compose files:
- `docker-compose.yml`: base services for Rails, Sidekiq, PostgreSQL, and Redis
- `docker-compose.production.yml`: Nginx production overlay that exposes only the reverse proxy publicly

The Rails image exposes Puma on `PORT` and remains independent of Nginx, Compose, Railway, Hostinger, and other hosting providers.
