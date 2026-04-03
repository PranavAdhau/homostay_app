class Admin::Api::V1::BaseController < Api::V1::BaseController
  before_action :authenticate_admin_user!
end
