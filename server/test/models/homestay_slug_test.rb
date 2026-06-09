require "test_helper"

class HomestaySlugTest < ActiveSupport::TestCase
  def create_homestay!(name: "ABC XYZ")
    Homestay.create!(
      name: name,
      description: "Test homestay",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  test "generates slug from name on create" do
    homestay = create_homestay!(name: "ABC XYZ")

    assert_equal "abc-xyz", homestay.slug
  end

  test "regenerates slug when name changes and preserves old slug redirect" do
    homestay = create_homestay!(name: "ABC XYZ")
    old_slug = homestay.slug

    homestay.update!(name: "XYZ ABC")
    homestay.reload

    assert_equal "xyz-abc", homestay.slug
    assert HomestaySlugRedirect.exists?(homestay: homestay, slug: old_slug)
    assert_equal homestay, HomestaySlugRedirect.find_by!(slug: old_slug).homestay
  end

  test "does not change slug when name is unchanged" do
    homestay = create_homestay!(name: "ABC XYZ")
    original_slug = homestay.slug

    homestay.update!(rooms: 3)

    assert_equal original_slug, homestay.reload.slug
    assert_empty homestay.slug_redirects
  end
end
