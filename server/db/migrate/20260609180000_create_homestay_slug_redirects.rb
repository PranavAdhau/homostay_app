class CreateHomestaySlugRedirects < ActiveRecord::Migration[7.2]
  def change
    create_table :homestay_slug_redirects do |t|
      t.references :homestay, null: false, foreign_key: true
      t.string :slug, null: false

      t.timestamps
    end

    add_index :homestay_slug_redirects, :slug, unique: true
  end
end
