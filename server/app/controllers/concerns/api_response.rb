module ApiResponse
  extend ActiveSupport::Concern

  def render_success(data: nil, message: nil, status: :ok)
    response = { success: true }
    response[:data] = data if data
    response[:message] = message if message
    render json: response, status: status
  end

  def render_error(message:, errors: nil, status: :unprocessable_entity)
    response = { success: false, message: message }
    response[:errors] = errors if errors
    render json: response, status: status
  end
end
