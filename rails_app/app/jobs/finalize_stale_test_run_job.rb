class FinalizeStaleTestRunJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find_by(id: test_run_id)
    return unless test_run&.running?

    started_at = test_run.started_at || test_run.created_at
    return if started_at && started_at > 20.minutes.ago

    test_run.with_lock do
      next unless test_run.running?

      test_run.update!(
        status: "failed",
        finished_at: Time.current
      )

      Artifact.create!(
        test_run: test_run,
        kind: "error_log",
        file_url: nil,
        metadata: [{ message: "Run timed out while waiting for completion callback" }]
      )
    end
  end
end
