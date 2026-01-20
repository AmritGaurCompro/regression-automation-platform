class Artifact < ApplicationRecord
  belongs_to :test_run
  has_one_attached :file

  enum kind: {
    screenshot: 'screenshot',
    video: 'video',
    trace: 'trace',
    error_log: 'error_log'
  }

  validates :kind, presence: true
end

