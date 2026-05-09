module Seo
  class SitemapEntries
    class << self
      def call(frontend_url:)
        new(frontend_url: frontend_url).call
      end
    end

    def initialize(frontend_url:)
      @frontend_url = frontend_url.chomp("/")
    end

    def call
      [*static_entries, *homestay_entries, *blog_entries]
    end

    private

    attr_reader :frontend_url

    def static_entries
      Seo::LocalityRoutes::ROUTES.map do |path|
        {
          loc: absolute_url(path),
          lastmod: latest_static_timestamp,
        }
      end
    end

    def homestay_entries
      Homestay.active.find_each.map do |homestay|
        {
          loc: absolute_url("/properties/#{homestay.slug}"),
          lastmod: homestay.updated_at,
        }
      end
    end

    def blog_entries
      Blog.published.find_each.map do |blog|
        {
          loc: absolute_url("/blogs/#{blog.id}-#{blog.slug}"),
          lastmod: blog.updated_at,
        }
      end
    end

    def absolute_url(path)
      "#{frontend_url}#{path == "/" ? "/" : path}"
    end

    def latest_static_timestamp
      @latest_static_timestamp ||= begin
        timestamps = [
          Homestay.active.maximum(:updated_at),
          Blog.published.maximum(:updated_at),
        ].compact

        timestamps.max || Time.current
      end
    end
  end
end
