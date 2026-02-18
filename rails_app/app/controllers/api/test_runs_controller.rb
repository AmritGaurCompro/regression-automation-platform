class Api::TestRunsController < ApplicationController
    # GET /api/tests/:test_id/test_runs
def index
  test = Test.find(params[:test_id])

  runs = test.test_runs
             .order(created_at: :desc)
             .limit(5)

  render json: runs.map { |run|
    {
      id: run.id,
      test_id: run.test_id,
      status: run.status,
      environment: run.environment,
      runner_mode: run.runner_mode,
      retries_on_failure: run.retries_on_failure,
      started_at: run.started_at,
      finished_at: run.finished_at,
      created_at: run.created_at,
      duration: calculate_duration(run)   # ✅ works here
    }
  }
end

  def show
    test_run = TestRun.find(params[:id])
    render json: test_run
  end

  def create
    test = Test.find(params[:test_id])

    test_run = test.test_runs.create!(
      script_id: test.script_id,
      environment: params[:environment] || "QA",
      runner_mode: params[:runner_mode] || "headless",
      retries_on_failure: params[:retries_on_failure] || 0,
      status: "running",
      started_at: Time.current,
      tags: params[:tags] || "default"
    )

    RunPlaywrightJob.perform_later(test_run.id)

    render json: {
      test_run_id: test_run.id,
      status: test_run.status
    }, status: :created
  end
  
  
  # ✅ duration helper
  def calculate_duration(test_run)
    return nil unless test_run&.created_at && test_run&.updated_at

    duration_seconds = (test_run.updated_at - test_run.created_at).to_i

    if duration_seconds < 60
      "#{duration_seconds}s"
    else
      minutes = duration_seconds / 60
      seconds = duration_seconds % 60
      "#{minutes}m #{seconds}s"
    end
  end

end
