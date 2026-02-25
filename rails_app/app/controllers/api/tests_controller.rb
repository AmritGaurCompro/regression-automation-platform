class Api::TestsController < ApplicationController
  SCRIPTS_DIR = Rails.root.join('automation', 'tests')

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
        startedAt: last_run&.created_at,
        finishedAt: last_run&.updated_at,
        duration: calculate_duration(last_run),
        tags: last_run&.tags || [],
        script: load_script_content(t.script_id),
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

  def show
    test = Test.includes(test_runs: :artifacts).find(params[:id])
    last_run = test.test_runs.order(created_at: :desc).first

    data = {
      id: test.id,
      title: test.title,
      environment: last_run&.environment,
      status: last_run&.status || "NEW",
      lastRun: last_run&.finished_at,
      startedAt: last_run&.created_at,
      finishedAt: last_run&.updated_at,
      duration: calculate_duration(last_run),
      tags: last_run&.tags || [],
      script: load_script_content(test.script_id),
      artifacts: last_run&.artifacts&.map do |a|
        {
          kind: a.kind,
          url: a.file_url,
          metadata: a.metadata
        }
      end || []
    }

    render json: data
  end

  private

  def load_script_content(script_id)
    return { raw: nil, normalized: nil } if script_id.blank?
    
    script = Script.find_by(id: script_id)
    return { raw: nil, normalized: nil } unless script
    
    {
      raw: script.raw_content,
      normalized: script.normalized_content
    }
  rescue StandardError => e
    Rails.logger.error("Error loading script #{script_id}: #{e.message}")
    { raw: nil, normalized: nil }
  end

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