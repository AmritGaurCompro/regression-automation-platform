class Api::TestsController < ApplicationController
  SCRIPTS_DIR = Rails.root.join('automation', 'tests')

  def index
    tests = Test.includes(test_runs: :artifacts)

    data = tests.map do |t|
      last_run = t.test_runs.order(created_at: :desc).first
      build_test_data(t, last_run)
    end

    render json: data
  end

  def show
    test     = Test.includes(test_runs: :artifacts).find(params[:id])
    last_run = test.test_runs.order(created_at: :desc).first
    render json: build_test_data(test, last_run)
  end

  # Called by GitHub Actions after recording finishes (production flow)
  # Saves recorded script content to Render disk + DB
  def script_content
    test    = Test.find(params[:id])
    script  = test.script
    content = params[:content].to_s

    return render json: { error: 'Content missing' }, status: :bad_request if content.blank?
    return render json: { error: 'No script associated with this test' }, status: :unprocessable_entity unless script

    # Write to disk — same as ImportTestsController
    tests_dir = Rails.root.join('automation', 'tests')
    FileUtils.mkdir_p(tests_dir)
    File.write(tests_dir.join(script.name), content)

    # Sync to DB
    script.update!(raw_content: content, normalized_content: content)

    render json: { status: 'saved', file: script.name }

  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Test not found' }, status: :not_found
  rescue => e
    Rails.logger.error("script_content callback failed: #{e.message}")
    render json: { error: e.message }, status: :internal_server_error
  end

  # Called by GitHub Actions to set/clear VNC URL during recording
  def update_vnc_url
    test     = Test.find(params[:id])
    last_run = test.test_runs.order(created_at: :desc).first

    return render json: { error: 'No test run found' }, status: :not_found unless last_run

    last_run.update!(vnc_url: params[:vnc_url])
    render json: { success: true }

  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Test not found' }, status: :not_found
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def build_test_data(test, last_run)
    {
      id:          test.id,
      title:       test.title,
      environment: last_run&.environment,
      status:      last_run&.status || "NEW",
      lastRun:     last_run&.finished_at,
      startedAt:   last_run&.created_at,
      finishedAt:  last_run&.updated_at,
      duration:    calculate_duration(last_run),
      tags:        last_run&.tags || [],
      vnc_url:     last_run&.vnc_url,
      script:      load_script_content(test.script_id),
      artifacts:   last_run&.artifacts&.map do |a|
        {
          kind:     a.kind,
          url:      a.file_url,
          metadata: a.metadata
        }
      end || []
    }
  end

  def load_script_content(script_id)
    return { raw: nil, normalized: nil } if script_id.blank?

    script = Script.find_by(id: script_id)
    return { raw: nil, normalized: nil } unless script

    normalized = normalize_script(script.raw_content, script_id)

    { raw: script.raw_content, normalized: normalized }
  rescue StandardError => e
    Rails.logger.error("Error loading script #{script_id}: #{e.message}")
    { raw: nil, normalized: nil }
  end

  def normalize_script(raw, script_id = nil)
    return nil if raw.blank?

    lines = raw.lines
    lines = lines.reject { |l| l.strip.start_with?('import ') }
    lines = lines.reject { |l| l.strip.start_with?("test('") || l.strip == '});' }
    lines = lines.drop_while { |l| l.strip.empty? }
    lines = lines.reverse.drop_while { |l| l.strip.empty? }.reverse
    lines = lines.map { |l| l.start_with?('  ') ? l[2..] : l }

    normalized = lines.join

    normalized = normalized.gsub(
      /page\.goto\(['"]https?:\/\/[^'"]+['"]\)/,
      "page.goto('/')"
    )
    normalized = normalized.gsub(
      /(getByRole\(['"]textbox['"],\s*\{\s*name:\s*['"](?:email|Email|username|Username|user|User)['"'][^}]*\}\s*\)\.fill\()['"][^'"]*['"]/,
      '\1process.env.TEST_USERNAME'
    )
    normalized = normalized.gsub(
      /(getBy(?:Label|Placeholder)\(['"](?:email|Email|username|Username|user|User)['"]\)\.fill\()['"][^'"]*['"]/,
      '\1process.env.TEST_USERNAME'
    )
    normalized = normalized.gsub(
      /(getByRole\(['"]textbox['"],\s*\{\s*name:\s*['"](?:password|Password|passwd|Passwd)['"'][^}]*\}\s*\)\.fill\()['"][^'"]*['"]/,
      '\1process.env.TEST_PASSWORD'
    )
    normalized = normalized.gsub(
      /(getBy(?:Label|Placeholder)\(['"](?:password|Password|passwd|Passwd)['"]\)\.fill\()['"][^'"]*['"]/,
      '\1process.env.TEST_PASSWORD'
    )
    normalized = normalized.gsub(
      /(getBy(?:Role|Label|Placeholder)\([^)]*['"](?:phone|Phone|mobile|Mobile|tel|Tel)['"'][^)]*\)\.fill\()['"][^'"]*['"]/,
      '\1process.env.TEST_PHONE'
    )
    normalized = normalized.gsub(
      /(getBy(?:Role|Label|Placeholder)\([^)]*['"](?:otp|OTP|code|Code|verification|Verification)['"'][^)]*\)\.fill\()['"][^'"]*['"]/,
      '\1process.env.TEST_OTP'
    )
    normalized = normalized.gsub(
      /(getBy(?:Role|Label|Placeholder)\([^)]*['"](?:card|Card|credit|Credit|cvv|CVV)['"'][^)]*\)\.fill\()['"][^'"]*['"]/,
      '\1process.env.TEST_CARD'
    )

    if script_id.present?
      Script.find_by(id: script_id)&.update!(normalized_content: normalized)
    end

    normalized
  rescue StandardError => e
    Rails.logger.error("Error normalizing script: #{e.message}")
    raw
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