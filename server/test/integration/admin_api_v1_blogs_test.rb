require "test_helper"

class AdminApiV1BlogsTest < ActionDispatch::IntegrationTest
  setup do
    @admin_user = AdminUser.create!(
      email: "admin@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  test "admin endpoints require authentication" do
    get "/admin/api/v1/blogs"

    assert_includes [302, 401], response.status
  end

  test "index returns blogs newest first" do
    sign_in @admin_user

    older = Blog.create!(title: "Older", content: "Body", is_published: false, created_at: 2.days.ago, updated_at: 2.days.ago)
    newer = Blog.create!(title: "Newer", content: "Body", is_published: true, created_at: Time.current, updated_at: Time.current)

    get "/admin/api/v1/blogs"

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal [newer.id, older.id], body["data"].map { |blog| blog["id"] }
  end

  test "create update and delete blog" do
    sign_in @admin_user

    assert_difference("Blog.count", 1) do
      post "/admin/api/v1/blogs", params: {
        blog: {
          title: "Journal entry",
          content: "Fresh content",
          is_published: true,
          image: Rack::Test::UploadedFile.new(
            StringIO.new("fake image"),
            "image/png",
            original_filename: "cover.png"
          )
        }
      }
    end

    assert_response :created
    create_body = JSON.parse(response.body)
    blog_id = create_body.dig("data", "id")
    assert_not_nil create_body.dig("data", "image_url")

    patch "/admin/api/v1/blogs/#{blog_id}", params: {
      blog: {
        title: "Updated title",
        content: "Updated content",
        is_published: false
      }
    }

    assert_response :success
    update_body = JSON.parse(response.body)
    assert_equal "Updated title", update_body.dig("data", "title")
    assert_equal false, update_body.dig("data", "is_published")

    assert_difference("Blog.count", -1) do
      delete "/admin/api/v1/blogs/#{blog_id}"
    end

    assert_response :success
  end
end
