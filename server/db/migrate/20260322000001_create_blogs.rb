class CreateBlogs < ActiveRecord::Migration[7.1]
  def change
    create_table :blogs do |t|
      t.string :title, null: false
      t.text :content, null: false
      t.boolean :is_published, null: false, default: true

      t.timestamps
    end

    add_index :blogs, :is_published
    add_index :blogs, :created_at
  end
end
