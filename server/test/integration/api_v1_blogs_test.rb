require "test_helper"

class ApiV1BlogsTest < ActionDispatch::IntegrationTest
  test "index returns only published blogs ordered desc and limited to latest four" do
    5.times do |index|
      Blog.create!(
        title: "Published #{index}",
        content: "Published content #{index}",
        is_published: true,
        created_at: index.days.ago,
        updated_at: index.days.ago
      )
    end
    Blog.create!(title: "Draft", content: "Hidden", is_published: false)

    get "/api/v1/blogs"

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal true, body["success"]
    assert_equal 4, body["data"].length
    assert_equal ["Published 0", "Published 1", "Published 2", "Published 3"], body["data"].map { |blog| blog["title"] }
    assert body["data"].all? { |blog| blog.key?("image_url") }
  end

  test "show hides unpublished blogs" do
    blog = Blog.create!(title: "Draft", content: "Hidden", is_published: false)

    get "/api/v1/blogs/#{blog.id}"

    assert_response :not_found
    body = JSON.parse(response.body)
    assert_equal false, body["success"]
  end

  test "show returns image url when attached and nil otherwise" do
    with_image = Blog.create!(title: "With image", content: "Body", is_published: true)
    with_image.image.attach(io: StringIO.new("fake image"), filename: "cover.png", content_type: "image/png")

    without_image = Blog.create!(title: "Without image", content: "Body", is_published: true)

    get "/api/v1/blogs/#{with_image.id}"
    assert_response :success
    with_image_body = JSON.parse(response.body)
    assert_not_nil with_image_body.dig("data", "image_url")

    get "/api/v1/blogs/#{without_image.id}"
    assert_response :success
    without_image_body = JSON.parse(response.body)
    assert_nil without_image_body.dig("data", "image_url")
  end
end
