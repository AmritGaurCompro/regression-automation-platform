class Api::ArtifactsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:webhook, :status]

  # Receives artifact URLs from GH Actions after Cloudinary upload
  def webhook
    test_run_id = params[:test_run_id]
    kind        = params[:kind]
    file_url    = params[:file_url]
    metadata    = params[:metadata]

    test_run = TestRun.find_by(id: test_run_id)
    return render json: { error: 'TestRun not found' }, status: :not_found unless test_run

    Artifact.create!(
      test_run: test_run,
      kind:     kind,
      file_url: file_url,
      metadata: metadata
    )

    render json: { status: 'saved' }, status: :ok

  rescue => e
    Rails.logger.error("Artifact webhook failed: #{e.message}")
    render json: { error: e.message }, status: :internal_server_error
  end

  # Receives final pass/fail from GH Actions after run.js completes
  # Mirrors what RunPlaywrightJob does locally after parsing ---RESULT---
  def status
    test_run_id = params[:test_run_id]
    success     = params[:success]  # "true" or "false"

    test_run = TestRun.find_by(id: test_run_id)
    return render json: { error: 'TestRun not found' }, status: :not_found unless test_run

    test_run.update!(
      status:      success == 'true' ? 'passed' : 'failed',
      finished_at: Time.current
    )

    Rails.logger.info("TestRun ##{test_run_id} → #{test_run.status} via GH Actions")
    render json: { status: test_run.status }, status: :ok

  rescue => e
    Rails.logger.error("Status webhook failed: #{e.message}")
    render json: { error: e.message }, status: :internal_server_error
  end
end
