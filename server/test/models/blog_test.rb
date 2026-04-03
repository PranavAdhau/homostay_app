require "test_helper"

class BlogTest < ActiveSupport::TestCase
  test "requires title" do
    blog = Blog.new(content: "Content body")

    assert_not blog.valid?
    assert_includes blog.errors[:title], "can't be blank"
  end

  test "requires content" do
    blog = Blog.new(title: "A title")

    assert_not blog.valid?
    assert_includes blog.errors[:content], "can't be blank"
  end

  test "published scope returns only published blogs" do
    published_blog = Blog.create!(title: "Published", content: "Visible", is_published: true)
    draft_blog = Blog.create!(title: "Draft", content: "Hidden", is_published: false)

    assert_includes Blog.published, published_blog
    assert_not_includes Blog.published, draft_blog
  end

  test "destroying a blog purges its image later" do
    blog = Blog.create!(title: "With image", content: "Attached", is_published: true)
    blog.image.attach(io: StringIO.new("fake image"), filename: "cover.png", content_type: "image/png")

    assert_enqueued_with(job: ActiveStorage::PurgeOneJob) do
      blog.destroy
    end
  end
end
