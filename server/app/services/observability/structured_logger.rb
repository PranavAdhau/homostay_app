require "json"

module Observability
  class StructuredLogger
    class << self
      def info(payload)
        log(:info, payload)
      end

      def warn(payload)
        log(:warn, payload)
      end

      def error(payload)
        log(:error, payload)
      end

      private

      def log(level, payload)
        Rails.logger.public_send(level, payload.compact.to_json)
      end
    end
  end
end
