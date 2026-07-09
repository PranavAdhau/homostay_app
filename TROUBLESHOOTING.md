# Troubleshooting

Common checks:
- `docker compose -f docker-compose.yml -f docker-compose.production.yml config`
- `docker compose -f docker-compose.yml -f docker-compose.production.yml ps`
- `docker compose -f docker-compose.yml -f docker-compose.production.yml logs rails --tail=100`
- `docker compose -f docker-compose.yml -f docker-compose.production.yml logs sidekiq --tail=100`
- `curl -fsS http://localhost/up`

Common issues:
- Missing Active Storage files: verify `rails_storage` volume is mounted to `server/storage`
- Rails cannot boot: verify `SECRET_KEY_BASE`, database env vars, and `REDIS_URL`
- Sidekiq connection errors: verify Redis and Postgres health
