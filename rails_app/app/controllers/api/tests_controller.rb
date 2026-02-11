class Api::TestsController < ApplicationController
  def index
    tests = Test.includes(test_runs: :artifacts)

    data = tests.map do |t|
      last_run = t.test_runs.order(created_at: :desc).first

      {
        id: t.id,
        title: t.title,
        environment: last_run&.environment,
        status: last_run&.status || "NEW",
        lastRun: last_run&.finished_at,
        tags: last_run&.tags || [],
        artifacts: last_run&.artifacts&.map do |a|
      {
        kind: a.kind,
        url: a.file_url,
        metadata: a.metadata
      }
    end || []
      }
    end

    render json: data
  end
end
