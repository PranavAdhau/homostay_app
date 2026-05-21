require "securerandom"

module Infrastructure
  class RedisLock
    Result = Struct.new(:acquired?, :token, keyword_init: true)

    LUA_RELEASE = <<~LUA.freeze
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    LUA

    def self.acquire(key:, ttl:)
      token = SecureRandom.hex(16)

      acquired = RedisClient.with do |redis|
        redis.set(key, token, nx: true, ex: ttl.to_i)
      end

      Result.new(acquired?: !!acquired, token: token)
    end

    def self.release(key:, token:)
      return if token.blank?

      RedisClient.with do |redis|
        redis.eval(LUA_RELEASE, keys: [key], argv: [token])
      end
    rescue Redis::BaseError, IOError, SystemCallError
      nil
    end

    def self.exists?(key)
      RedisClient.with { |redis| redis.exists?(key) }
    end
  end
end
