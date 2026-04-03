# Rails Backend Setup Instructions

## Prerequisites

Before proceeding, you need to install:

1. **Ruby** (3.1+ recommended)
   - Windows: Use [RubyInstaller](https://rubyinstaller.org/)
   - Or use [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) with Ubuntu

2. **Rails** (7.1+)
   ```bash
   gem install rails
   ```

3. **PostgreSQL**
   - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Or use [PostgreSQL via WSL2](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-database)

4. **Redis**
   - Windows: Use [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) or [Memurai](https://www.memurai.com/) (Redis-compatible for Windows)
   - Or use Redis via WSL2

## Initial Rails Setup

Once Ruby/Rails is installed, run from the project root:

```bash
cd homestay_app
rails new . --database=postgresql --skip-git
```

This will generate the full Rails app structure in the `homestay_app` directory.

## Next Steps

After Rails is generated:

1. Install gems: `bundle install`
2. Configure database: Edit `config/database.yml`
3. Create database: `rails db:create`
4. Run migrations: `rails db:migrate`
5. Start Rails server: `rails s` (port 3000)

See the main plan document for complete implementation details.
