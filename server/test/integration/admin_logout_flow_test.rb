require "test_helper"

class AdminLogoutFlowTest < ActionDispatch::IntegrationTest
  setup do
    @admin = AdminUser.create!(
      email: "logout-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
  end

  test "sign out redirects to the admin login page and ends the session" do
    sign_in @admin

    delete "/admin/sign_out"

    assert_response :redirect
    assert_redirected_to "/admin/sign_in"

    follow_redirect!
    assert_response :success

    get "/admin/api/v1/dashboard/stats"
    assert_response :unauthorized
  end
end
