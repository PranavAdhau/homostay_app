# Sacred Homes Architecture

Sacred Homes uses a provider-agnostic production architecture centered on Docker Compose. The canonical service chain is `nginx -> rails(puma) -> postgres`, with `redis` shared by Rails and Sidekiq. The Rails container remains Nginx-agnostic and is intended to be reachable internally in Compose while the reverse proxy is exposed publicly.

Why this architecture:
- Matches the existing VPS runtime shape
- Keeps the Rails image independent of Nginx and hosting providers
- Preserves local-disk Active Storage
- Keeps each service independently replaceable

Persistent paths:
- `postgres_data` volume
- `redis_data` volume
- `rails_storage` volume mounted to `server/storage`

Deferred work:
- Cloud object storage
- CDN
- Multi-region
- High availability
- Autoscaling
- Blue/Green deployments
- Kubernetes manifests
