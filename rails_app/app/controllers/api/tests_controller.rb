class Api::TestsController < ApplicationController
  def index
    tests = Test.includes(:test_runs)

    data = tests.map do |t|
      last_run = t.test_runs.order(created_at: :desc).first

      {
        id: t.id,
        title: t.title,
        environment: last_run&.environment,
        status: last_run&.status || "NEW",
        lastRun: last_run&.finished_at,
        tags: last_run&.tags || []
      }
    end

    render json: data
  end
end
