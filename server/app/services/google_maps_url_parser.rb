class GoogleMapsUrlParser
  def self.call(url)
    new(url).call
  end

  def initialize(url)
    @url = url.to_s.strip
  end

  def call
    return nil if @url.blank?

    uri = safely_parse_uri(@url)
    return nil unless uri

    lat, lng = extract_from_query(uri)
    lat, lng = extract_from_at_pattern(uri) unless valid_coordinates?(lat, lng)

    if !valid_coordinates?(lat, lng) && short_google_maps_host?(uri.host)
      resolved = resolve_short_url(uri)
      if resolved
        lat, lng = extract_from_query(resolved)
        lat, lng = extract_from_at_pattern(resolved) unless valid_coordinates?(lat, lng)
      end
    end

    return nil unless valid_coordinates?(lat, lng)

    [lat, lng]
  rescue StandardError
    nil
  end

  private

  def safely_parse_uri(raw)
    URI.parse(raw)
  rescue URI::InvalidURIError
    nil
  end

  def extract_from_query(uri)
    return [nil, nil] unless uri.query

    params = Rack::Utils.parse_nested_query(uri.query)
    q = params["q"]
    return [nil, nil] unless q

    extract_from_pair_string(q)
  end

  def extract_from_at_pattern(uri)
    full = uri.to_s
    if full =~ /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/ # @lat,lng
      [Regexp.last_match(1).to_f, Regexp.last_match(2).to_f]
    else
      [nil, nil]
    end
  end

  def extract_from_pair_string(str)
    if str =~ /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/
      [Regexp.last_match(1).to_f, Regexp.last_match(2).to_f]
    else
      [nil, nil]
    end
  end

  def short_google_maps_host?(host)
    host.to_s.downcase == "maps.app.goo.gl"
  end

  def resolve_short_url(uri)
    require "net/http"

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.open_timeout = 3
    http.read_timeout = 3

    path = uri.path
    response = http.get(path)

    case response
    when Net::HTTPRedirection
      location = response["location"]
      safely_parse_uri(location) if location.present?
    else
      nil
    end
  rescue StandardError
    nil
  end

  def valid_coordinates?(lat, lng)
    return false if lat.nil? || lng.nil?

    lat.between?(-90, 90) && lng.between?(-180, 180)
  end
end

