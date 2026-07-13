module Infrastructure
  class ActiveStorageConfig
    S3_ENV_GROUPS = [
      %w[ACTIVE_STORAGE_BUCKET ACTIVE_STORAGE_ACCESS_KEY_ID ACTIVE_STORAGE_SECRET_ACCESS_KEY ACTIVE_STORAGE_ENDPOINT],
      %w[BUCKET ACCESS_KEY_ID SECRET_ACCESS_KEY ENDPOINT],
      %w[AWS_S3_BUCKET_NAME AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_ENDPOINT_URL],
      %w[BUCKET AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY ENDPOINT]
    ].freeze

    class << self
      def service_name(env = ENV)
        explicit_service = env["ACTIVE_STORAGE_SERVICE"].to_s.strip
        return explicit_service.downcase.to_sym if explicit_service.present?

        s3_configured?(env) ? :s3 : :local
      end

      def s3_configured?(env = ENV)
        S3_ENV_GROUPS.any? { |keys| keys.all? { |key| env[key].present? } }
      end
    end
  end
end
