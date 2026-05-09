class AddSeoContentFieldsToBlogsAndHomestays < ActiveRecord::Migration[7.1]
  def change
    change_table :blogs, bulk: true do |t|
      t.text :seo_summary
      t.string :featured_locality
      t.text :locality_tags
      t.text :nearby_landmark_tags
      t.text :related_homestay_ids
      t.text :related_blog_ids
      t.text :faq_entries
    end

    change_table :homestays, bulk: true do |t|
      t.text :seo_summary
      t.string :seo_locality_focus
      t.text :locality_tags
      t.text :nearby_landmark_tags
      t.text :related_blog_ids
      t.text :related_homestay_ids
      t.text :faq_entries
    end
  end
end
