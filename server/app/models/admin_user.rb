class AdminUser < ApplicationRecord
  has_many :created_manual_inventory_blocks,
           class_name: "ManualInventoryBlock",
           foreign_key: :created_by_admin_user_id,
           dependent: :nullify
  has_many :unlocked_manual_inventory_blocks,
           class_name: "ManualInventoryBlock",
           foreign_key: :unlocked_by_admin_user_id,
           dependent: :nullify

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable,
         :trackable,
         :lockable
end
