Rails.application.routes.draw do
  root "spa#index"
  get "spa/index"
  get "/sitemap.xml", to: "sitemaps#show", defaults: { format: :xml }

  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :admin_users, path: "admin", controllers: {
    sessions: 'admin_users/sessions',
    passwords: 'admin_users/passwords'
  }

  namespace :api do
    namespace :v1 do
      resources :blogs, only: [:index, :show]
      resources :homestays, only: [:index, :show] do
        member do
          get :availability
        end
      end
      resources :bookings, only: [:create, :show]
      resource :site_settings, only: [:show], controller: "site_settings"
      resource :host_profile, only: [:show]
      resource :site_content, only: [:show]
    end
  end

  get "/calendars/:homestay_id.ics", to: "calendars#show", as: :homestay_calendar

  namespace :admin do
    namespace :api do
      namespace :v1 do
        resources :blogs
        resources :homestays do
          member do
            post :sync_calendar
            get :calendar_inventory
          end
          resources :manual_inventory_blocks, only: [:create], controller: "manual_inventory_blocks" do
            member do
              patch :unlock
            end
          end
        end
        resources :bookings, only: [:index, :show, :update] do
          member do
            post :preflight
            patch :approve
            patch :reject
          end
        end
        resources :amenities, only: [:index]
        resource :site_setting, only: [:show, :update]
        resource :host_profile, only: [:show, :update]
        resource :site_content, only: [:show, :update]
        get 'dashboard/stats', to: 'dashboard#stats'
      end
    end

  end

  if Rails.env.development? && defined?(LetterOpenerWeb)
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  require "sidekiq/web"
  authenticate :admin_user do
    mount Sidekiq::Web => "/sidekiq"
  end

  if Rails.env.development?
    get "/@react-refresh", to: "spa#vite_asset"
    get "/@vite/*path", to: "spa#vite_asset"
    get "/@id/*path", to: "spa#vite_asset"
    get "/@fs/*path", to: "spa#vite_asset"
    get "/src/*path", to: "spa#vite_asset"
    get "/node_modules/*path", to: "spa#vite_asset"
  else
    get "/vite/*path", to: "spa#published_asset", defaults: { asset_root: "vite" }
    get "/assets/*path", to: "spa#published_asset", defaults: { asset_root: "assets" }
  end

  # Chrome DevTools may probe this path during local development. Return an
  # empty JSON response so it doesn't show up as a routing error in dev logs.
  get "/.well-known/appspecific/com.chrome.devtools.json",
    to: proc { [200, { "Content-Type" => "application/json", "Cache-Control" => "no-store" }, ['{}']] }

  get '*path',
    to: 'spa#index',
    constraints: ->(req) { !req.xhr? && req.format.html? }
end
