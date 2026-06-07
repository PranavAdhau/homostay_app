class MigrateConfirmedBookingsToApproved < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL.squish
      UPDATE bookings
      SET status = 1
      WHERE status = 2
    SQL
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "Confirmed bookings were merged into approved bookings."
  end
end
