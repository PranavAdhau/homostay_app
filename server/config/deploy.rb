# Deployment configuration and scripts
# This file contains deployment instructions and helper scripts

# Production Build Process:
#
# 1. Build Frontend:
#    cd client && npm run build
#
# 2. Copy Assets to Rails public directory:
#    rm -rf server/public/assets
#    mkdir -p server/public/assets
#    cp client/build/index.html server/public/index.html
#    cp -r client/build/assets/. server/public/assets/
#
# 3. Precompile Rails Assets (if using asset pipeline):
#    cd server && rails assets:precompile RAILS_ENV=production
#
# 4. Run Database Migrations:
#    cd server && rails db:migrate RAILS_ENV=production
#
# 5. Restart Services:
#    systemctl restart puma
#    systemctl restart sidekiq
#    systemctl restart nginx
