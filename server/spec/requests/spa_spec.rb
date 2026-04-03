require 'rails_helper'

RSpec.describe "Spas", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/spa/index"
      expect(response).to have_http_status(:success)
    end
  end

end
