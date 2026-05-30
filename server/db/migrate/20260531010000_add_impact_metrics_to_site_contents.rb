class AddImpactMetricsToSiteContents < ActiveRecord::Migration[7.2]
  def change
    change_table :site_contents, bulk: true do |t|
      t.integer :donation_percentage
      t.bigint :total_contribution_amount
    end
  end
end
