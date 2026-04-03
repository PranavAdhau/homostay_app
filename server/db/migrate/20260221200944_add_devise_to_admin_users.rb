class AddDeviseToAdminUsers < ActiveRecord::Migration[7.2]
  # NOTE:
  # Devise columns were already added previously.
  # This migration is intentionally kept empty
  # to prevent duplicate column/index errors.

  def up
    # No changes required
  end

  def down
    # Nothing to rollback
  end
end