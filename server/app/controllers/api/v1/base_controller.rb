class Api::V1::BaseController < ApplicationController
  include ApiResponse
  
  skip_before_action :verify_authenticity_token
  before_action :set_default_response_format
  
  private
  
  def set_default_response_format
    request.format = :json
  end
end
