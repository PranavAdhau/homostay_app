class CreateSiteContents < ActiveRecord::Migration[7.2]
  def change
    create_table :site_contents do |t|
      t.timestamps
    end
  end
end
