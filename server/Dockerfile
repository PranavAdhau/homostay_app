# syntax = docker/dockerfile:1.7

ARG RUBY_VERSION=3.3.10
ARG NODE_VERSION=20.19.0
ARG BUNDLER_VERSION=2.7.2

FROM node:${NODE_VERSION}-bookworm-slim AS frontend-build
WORKDIR /app/client

COPY client/package.json client/package-lock.json ./

RUN npm config set fetch-retries 5 && \
    npm ci --prefer-online --no-audit

COPY client/ ./
ARG VITE_FRONTEND_URL=""
ARG VITE_API_BASE_URL=""
ENV VITE_FRONTEND_URL="${VITE_FRONTEND_URL}" \
    VITE_API_BASE_URL="${VITE_API_BASE_URL}"
RUN npm run build:production

FROM ruby:${RUBY_VERSION}-slim AS gems
WORKDIR /app/server
ARG BUNDLER_VERSION

ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=development:test

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*

COPY server/Gemfile server/Gemfile.lock ./
RUN gem install bundler -v "${BUNDLER_VERSION}" && \
    bundle _${BUNDLER_VERSION}_ install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

FROM ruby:${RUBY_VERSION}-slim AS app
WORKDIR /app/server

ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=development:test

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libvips postgresql-client libpq5 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=gems /usr/local/bundle /usr/local/bundle
COPY server/ ./
COPY scripts/ /app/server/scripts/
RUN chmod +x /app/server/scripts/*.sh
RUN chmod +x /app/server/bin/railway-start /app/server/bin/railway-predeploy
COPY --from=frontend-build /app/client/build/ ./public/

RUN bundle exec bootsnap precompile --gemfile && \
    bundle exec bootsnap precompile app/ lib/ && \
    useradd rails --create-home --shell /bin/bash && \
    mkdir -p log tmp/pids tmp/cache tmp/sockets storage && \
    chown -R rails:rails log tmp storage public

USER rails:rails

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["./bin/docker-entrypoint"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
