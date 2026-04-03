# This migration creates the necessary tables for ActionText (Rich Text)
# ActionText tables are typically created by running:
# rails action_text:install
# But we'll create them manually here for completeness

class CreateActionTextTables < ActiveRecord::Migration[7.1]
  def change
    create_table :action_text_rich_texts do |t|
      t.string :name, null: false
      t.text :body, limit: 255
      t.references :record, null: false, polymorphic: true, index: false

      t.timestamps
    end

    add_index :action_text_rich_texts, [:record_type, :record_id, :name], 
              name: "index_action_text_rich_texts_uniqueness", unique: true
  end
end
