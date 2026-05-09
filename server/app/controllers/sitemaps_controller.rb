class SitemapsController < ApplicationController
  def show
    entries = Seo::SitemapEntries.call(frontend_url: frontend_url)
    latest_update = entries.filter_map { |entry| entry[:lastmod] }.max || Time.current

    fresh_when(last_modified: latest_update, public: true)

    return if performed?

    render xml: build_xml(entries)
  end

  private

  def frontend_url
    ENV.fetch("FRONTEND_URL", request.base_url).to_s.chomp("/")
  end

  def build_xml(entries)
    xml = Builder::XmlMarkup.new(indent: 2)
    xml.instruct!
    xml.urlset(xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9") do
      entries.each do |entry|
        xml.url do
          xml.loc(entry[:loc])
          xml.lastmod(entry[:lastmod].utc.iso8601) if entry[:lastmod].respond_to?(:iso8601)
        end
      end
    end
  end
end
