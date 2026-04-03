require "net/http"
require "uri"

module CalendarSync
  class FetchIcs
    MAX_BYTES = 2 * 1024 * 1024

    def self.call(url)
      new(url).call
    end

    def initialize(url)
      @url = url
    end

    def call
      raise ArgumentError, "ICS URL is blank" if @url.blank?

      sleep rand(0..3)

      attempts = 0
      backoffs = [0.5, 1.0, 2.0]

      begin
        attempts += 1
        body = fetch_once
        validate_size!(body)
        body
      rescue StandardError => e
        raise e if attempts > backoffs.length

        sleep(backoffs[attempts - 1] + rand(0.0..0.3))
        retry
      end
    end

    private

    def fetch_once
      uri = URI.parse(@url)

      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 5, read_timeout: 10) do |http|
        request = Net::HTTP::Get.new(uri.request_uri)
        response = http.request(request)

        unless response.is_a?(Net::HTTPSuccess)
          raise "Failed to fetch ICS: #{response.code} #{response.message}"
        end

        body = +""
        response.read_body do |chunk|
          body << chunk
          if body.bytesize > MAX_BYTES
            raise "ICS response too large (> #{MAX_BYTES} bytes)"
          end
        end

        body
      end
    end

    def validate_size!(body)
      if body.bytesize > MAX_BYTES
        raise "ICS response too large (> #{MAX_BYTES} bytes)"
      end
    end
  end
end

