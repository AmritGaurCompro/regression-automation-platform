class Api::TestRunsController < ApplicationController
  def create
    test = Test.find(params[:test_id])

    test_run = test.test_runs.create!(
      script_id: test.script_id,
      environment: params[:environment] || "QA",
      runner_mode: params[:runner_mode] || "headless",
      retries_on_failure: params[:retries_on_failure] || 0,
      status: "not_run",
      started_at: Time.current
    )

    RunPlaywrightJob.perform_later(test_run.id)

    render json: {
      test_run_id: test_run.id,
      status: test_run.status
    }, status: :created
  end
end
