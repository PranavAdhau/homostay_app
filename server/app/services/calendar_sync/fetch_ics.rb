require "net/http"
require "uri"

module CalendarSync
  class FetchIcs
    class Error < StandardError; end
    class InvalidUrlError < Error; end
    class TimeoutError < Error; end
    class ResponseTooLargeError < Error; end
    class FetchFailedError < Error; end

    MAX_BYTES = 2 * 1024 * 1024

    def self.call(url)
      new(url).call
    end

    def initialize(url)
      @url = url
    end

    def call
      raise InvalidUrlError, "ICS URL is blank" if @url.blank?

      attempts = 0
      backoffs = [0.5, 1.0, 2.0]

      begin
        attempts += 1
        body = fetch_once
        validate_size!(body)
        body
      rescue TimeoutError, ResponseTooLargeError, FetchFailedError, InvalidUrlError => e
        raise e if attempts > backoffs.length

        sleep(backoffs[attempts - 1] + rand(0.0..0.3))
        retry
      end
    end

    private

    def fetch_once
      uri = URI.parse(@url)
      validate_uri!(uri)

      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 5, read_timeout: 10) do |http|
        request = Net::HTTP::Get.new(uri.request_uri)
        response = http.request(request)

        status = response.code.to_i

        unless status.between?(200, 299)
          raise FetchFailedError, "Unable to fetch Airbnb calendar"
        end

        body = response.body.to_s

        if body.bytesize > MAX_BYTES
          raise ResponseTooLargeError, "Airbnb calendar response was too large"
        end

        body
      end
    rescue URI::InvalidURIError
      raise InvalidUrlError, "Airbnb calendar URL is invalid"
    rescue Net::OpenTimeout, Net::ReadTimeout
      raise TimeoutError, "Airbnb calendar request timed out"
    end

    def validate_size!(body)
      if body.bytesize > MAX_BYTES
        raise ResponseTooLargeError, "Airbnb calendar response was too large"
      end
    end

    def validate_uri!(uri)
      host = uri.host.to_s.downcase
      path = uri.path.to_s

      return if uri.is_a?(URI::HTTPS) &&
                host.in?(%w[airbnb.com www.airbnb.com]) &&
                path.start_with?("/calendar/ical/") &&
                path.downcase.ends_with?(".ics")

      raise InvalidUrlError, "Airbnb calendar URL is invalid"
    end
  end
end
