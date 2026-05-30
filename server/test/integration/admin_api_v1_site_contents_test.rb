require "test_helper"

class AdminApiV1SiteContentsTest < ActionDispatch::IntegrationTest
  setup do
    @admin = AdminUser.create!(
      email: "site-content-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
    sign_in @admin
  end

  def parsed_response
    JSON.parse(response.body)
  end

  test "show returns impact metrics and update persists them" do
    SiteContent.instance.update!(
      donation_percentage: 3,
      total_contribution_amount: 500_000
    )

    get "/admin/api/v1/site_content"

    assert_response :success
    assert_equal 3, parsed_response.dig("data", "donation_percentage")
    assert_equal 500_000, parsed_response.dig("data", "total_contribution_amount")

    patch "/admin/api/v1/site_content", params: {
      site_content: {
        donation_percentage: 5,
        total_contribution_amount: 750_000
      }
    }

    assert_response :success
    assert_equal 5, parsed_response.dig("data", "donation_percentage")
    assert_equal 750_000, parsed_response.dig("data", "total_contribution_amount")
  end

  test "update rejects negative impact metrics" do
    patch "/admin/api/v1/site_content", params: {
      site_content: {
        donation_percentage: -1,
        total_contribution_amount: -100
      }
    }

    assert_response :unprocessable_entity
    assert_equal false, parsed_response["success"]
  end
end
