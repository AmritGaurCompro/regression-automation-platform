class Test < ApplicationRecord
  belongs_to :user
  belongs_to :feature, optional: true
  belongs_to :script, dependent: :destroy
  has_many :test_runs, dependent: :destroy
  validates :title, presence: true
end
