require "active_support/core_ext/integer/time"
require "uri"
require "set"
require Rails.root.join("lib/infrastructure/active_storage_config").to_s

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true

  # Ensures that a master key has been made available in ENV["RAILS_MASTER_KEY"], config/master.key, or an environment
  # key such as config/credentials/production.key. This key is used to decrypt credentials (and other encrypted files).
  # config.require_master_key = true

  # Enable serving static files from `public/` (or use Nginx)
  config.public_file_server.enabled = ActiveModel::Type::Boolean.new.cast(
    ENV.fetch("RAILS_SERVE_STATIC_FILES", "true")
  )

  # Compress CSS using a preprocessor.
  # config.assets.css_compressor = :sass

  # Do not fall back to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false if config.respond_to?(:assets)

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for Apache
  # config.action_dispatch.x_sendfile_header = "X-Accel-Redirect" # for NGINX

  # Store uploaded files on S3-compatible object storage in production when configured.
  config.active_storage.service = Infrastructure::ActiveStorageConfig.service_name

  # Mount Action Cable outside main process or domain.
  # config.action_cable.mount_path = nil
  # config.action_cable.url = "wss://example.com/cable"
  # config.action_cable.allowed_request_origins = [ "http://example.com", /http:\/\/example.*/ ]

  # Assume all access to the app is happening through a SSL-terminating reverse proxy.
  # Can be used together with config.force_ssl for Strict-Transport-Security and secure cookies.
  # config.assume_ssl = true

  # Force SSL only when the deployment environment is ready for HTTPS.
  # The Hostinger IP-only bootstrap uses HTTP first, then enables this after DNS/Certbot.
  config.force_ssl = ActiveModel::Type::Boolean.new.cast(ENV.fetch("RAILS_FORCE_SSL", "true"))
  config.assume_ssl = config.force_ssl

  # Log to STDOUT by default
  config.logger = ActiveSupport::Logger.new(STDOUT)
    .tap  { |logger| logger.formatter = ::Logger::Formatter.new }
    .then { |logger| ActiveSupport::TaggedLogging.new(logger) }

  # Prepend all log lines with the following tags.
  config.log_tags = [ :request_id ]

  # "info" includes generic and useful information about system operation, but avoids logging too much
  # information to avoid inadvertent exposure of personally identifiable information (PII). If you
  # want to log everything, set the level to "debug".
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # Use a different cache store in production.
  # config.cache_store = :mem_cache_store

  # Use Sidekiq for background jobs in production.
  config.active_job.queue_adapter = :sidekiq
  # config.active_job.queue_name_prefix = "homostay_app_production"

  config.action_mailer.perform_caching = false
  production_url =
    ENV["BACKEND_URL"].presence ||
    ENV["FRONTEND_URL"].presence ||
    ENV["RAILWAY_PUBLIC_DOMAIN"].presence&.then { |domain| "https://#{domain}" } ||
    "http://localhost"
  production_uri = URI.parse(production_url)
  default_url_options = {
    protocol: production_uri.scheme,
    host: production_uri.host,
    port: production_uri.port
  }

  config.action_mailer.default_url_options = default_url_options
  Rails.application.routes.default_url_options = default_url_options

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Enable DNS rebinding protection and other `Host` header attacks.
  config.hosts =
    if ENV["APP_HOSTS"].present?
      ENV["APP_HOSTS"].split(",").map(&:strip).reject(&:blank?)
    else
      host_candidates = Set.new(%w[localhost 127.0.0.1 rails nginx])

      [ ENV["BACKEND_URL"], ENV["FRONTEND_URL"] ].compact.each do |url|
        uri = URI.parse(url)
        host_candidates << uri.host if uri.host.present?
      rescue URI::InvalidURIError
        next
      end

      host_candidates << ENV["RAILWAY_PUBLIC_DOMAIN"] if ENV["RAILWAY_PUBLIC_DOMAIN"].present?

      host_candidates.to_a
    end

  # Skip DNS rebinding protection for the default health check endpoint.
  config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
end
