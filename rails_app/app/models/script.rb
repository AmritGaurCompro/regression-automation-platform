class Script < ApplicationRecord
  has_many :tests, dependent: :destroy

  validates :name, presence: true
  validates :language, inclusion: { in: %w[javascript typescript] }
end

