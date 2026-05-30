require "test_helper"

class ApiV1SiteContentsTest < ActionDispatch::IntegrationTest
  def parsed_response
    JSON.parse(response.body)
  end

  test "show exposes impact metrics for the public site" do
    SiteContent.instance.update!(
      donation_percentage: 3,
      total_contribution_amount: 500_000
    )

    get "/api/v1/site_content"

    assert_response :success
    assert_equal 3, parsed_response.dig("data", "donation_percentage")
    assert_equal 500_000, parsed_response.dig("data", "total_contribution_amount")
  end
end
