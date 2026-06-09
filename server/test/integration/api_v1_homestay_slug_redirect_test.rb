require "test_helper"

class ApiV1HomestaySlugRedirectTest < ActionDispatch::IntegrationTest
  test "resolves homestay by previous slug redirect" do
    homestay = Homestay.create!(
      name: "ABC XYZ",
      description: "Slug redirect test",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
    old_slug = homestay.slug
    homestay.update!(name: "XYZ ABC")

    get "/api/v1/homestays/#{old_slug}"

    assert_response :success
    assert_equal homestay.id, parsed_response.dig("data", "id")
    assert_equal "xyz-abc", parsed_response.dig("data", "slug")
  end

  def parsed_response
    JSON.parse(response.body)
  end
end
