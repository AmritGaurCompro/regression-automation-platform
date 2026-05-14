class Test < ApplicationRecord
  belongs_to :user
  belongs_to :script
  has_many :test_runs, dependent: :destroy

  validates :title, presence: true
end
