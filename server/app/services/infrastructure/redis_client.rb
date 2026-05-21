require "redis"

module Infrastructure
  class RedisClient
    class << self
      def with
        yield client
      rescue Redis::BaseError, IOError, SystemCallError => e
        raise e
      end

      private

      def client
        @client ||= Redis.new(url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0"))
      end
    end
  end
end
