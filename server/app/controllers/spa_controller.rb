require "net/http"

class SpaController < ApplicationController
  layout "application"

  def index
    if Rails.env.development?
      return render :index
    end

    # Non-development environments serve the published Vite build directly from
    # server/public/index.html with hashed files in server/public/assets.
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    render file: Rails.public_path.join("index.html"), layout: false
  end

  def vite_asset
    return head :not_found unless Rails.env.development?

    proxy_vite_request!
  end

  def published_asset
    asset_root = params[:asset_root].presence || "assets"
    asset_base_path = Rails.public_path.join(asset_root).cleanpath
    asset_path = asset_base_path.join(params[:path].to_s).cleanpath

    return head :not_found unless asset_path.to_s.start_with?(asset_base_path.to_s)
    return head :not_found unless asset_path.file?

    if Rails.env.test?
      response.headers["Cache-Control"] = "no-store, max-age=0, must-revalidate"
      response.headers["Pragma"] = "no-cache"
      response.headers["Expires"] = "0"
    end

    send_file asset_path, disposition: "inline", type: Rack::Mime.mime_type(asset_path.extname)
  end

  private

  def proxy_vite_request!
    vite_base_url = ENV.fetch("FRONTEND_URL", "http://localhost:5173").chomp("/")
    vite_uri = URI.parse("#{vite_base_url}#{request.fullpath}")
    vite_response = Net::HTTP.get_response(vite_uri)

    response.headers["Cache-Control"] = "no-store"
    response.headers["Access-Control-Allow-Origin"] = request.base_url
    response.headers["Vary"] = "Origin"

    content_type = vite_response["content-type"]
    status = vite_response.code.to_i
    body = vite_response.body.to_s

    if content_type.present?
      render plain: body, status: status, content_type: content_type
    else
      render plain: body, status: status
    end
  rescue StandardError => error
    Rails.logger.error("Vite proxy failed for #{request.fullpath}: #{error.class} - #{error.message}")
    render plain: "Vite dev server is unavailable. Start it with `npm run dev`.", status: :bad_gateway
  end
end
