require "test_helper"

class AdminApiV1HomestaysTest < ActionDispatch::IntegrationTest
  setup do
    @admin = AdminUser.create!(
      email: "homestay-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
    sign_in @admin
  end

  def create_homestay!(rooms: 2)
    Homestay.create!(
      name: "Rooms Test Stay",
      slug: SecureRandom.hex(6),
      description: "Rooms test stay description",
      capacity: 4,
      rooms: rooms,
      price_per_night: 500,
      is_active: true
    )
  end

  def parsed_response
    JSON.parse(response.body)
  end

  test "updates rooms count via json payload" do
    homestay = create_homestay!(rooms: 2)

    patch "/admin/api/v1/homestays/#{homestay.id}", params: {
      homestay: {
        name: homestay.name,
        description: homestay.description,
        capacity: homestay.capacity,
        rooms: 3,
        price_per_night: homestay.price_per_night,
        is_active: homestay.is_active
      }
    }, as: :json

    assert_response :success
    assert_equal 3, parsed_response.dig("data", "rooms")
    assert_equal 3, homestay.reload.rooms
  end

  test "updates rooms count via multipart form data" do
    homestay = create_homestay!(rooms: 2)

    patch "/admin/api/v1/homestays/#{homestay.id}", params: {
      homestay: {
        name: homestay.name,
        description: homestay.description,
        capacity: homestay.capacity,
        rooms: 3,
        price_per_night: homestay.price_per_night,
        is_active: homestay.is_active
      }
    }

    assert_response :success
    assert_equal 3, parsed_response.dig("data", "rooms")
    assert_equal 3, homestay.reload.rooms
  end
end
