# Deployment

Docker Compose is the canonical deployment reference.

Targets derived from the same architecture:
- Hostinger VPS
- Railway
- Render
- Fly.io
- DigitalOcean
- Future Kubernetes

Runtime services:
- `nginx`
- `rails`
- `sidekiq`
- `postgres`
- `redis`

Production environment template:
- Copy [.env.production](.env.production) to the deployment host and fill in values before deployment.
- Run `bash scripts/check-production-env.sh` before starting the stack.

SSL rollout:
- Development: `RAILS_FORCE_SSL=false`
- First VPS deployment using a server IP: `RAILS_FORCE_SSL=false`
- Domain + Let's Encrypt: `RAILS_FORCE_SSL=true`

Disaster recovery scenarios:
- Server loss: rebuild host, restore secrets, restore data volumes, boot stack
- Disk corruption: restore only affected backup domain when possible
- Accidental deletion: restore the relevant domain, then verify app health
- Bad deployment: roll back image/config first, restore data only if damaged
- Database corruption: restore PostgreSQL independently and verify storage metadata links
