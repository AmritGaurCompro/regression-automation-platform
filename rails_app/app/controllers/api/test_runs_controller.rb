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
        vnc_url: last_run&.vnc_url, 
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
      vnc_url: last_run&.vnc_url,
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

  normalized = normalize_script(script.raw_content, script_id)

  {
    raw: script.raw_content,
    normalized: normalized
  }
rescue StandardError => e
  Rails.logger.error("Error loading script #{script_id}: #{e.message}")
  { raw: nil, normalized: nil }
end

def normalize_script(raw, script_id = nil)
  return nil if raw.blank?

  lines = raw.lines

  # Remove import statements
  lines = lines.reject { |l| l.strip.start_with?('import ') }

  # Remove test wrapper line and closing brace
  lines = lines.reject { |l| l.strip.start_with?("test('") || l.strip == '});' }

  # Remove blank lines at start and end
  lines = lines.drop_while { |l| l.strip.empty? }
  lines = lines.reverse.drop_while { |l| l.strip.empty? }.reverse

  # Remove one level of indentation (2 spaces)
  lines = lines.map { |l| l.start_with?('  ') ? l[2..] : l }

  normalized = lines.join

  # 1. Replace hardcoded URLs with baseURL from Playwright config
  normalized = normalized.gsub(
    /page\.goto\(['"]https?:\/\/[^'"]+['"]\)/,
    "page.goto('/')"
  )

  # 2. Replace email/username fields with process.env.TEST_USERNAME
  normalized = normalized.gsub(
    /(getByRole\(['"]textbox['"],\s*\{\s*name:\s*['"](?:email|Email|username|Username|user|User)['"'][^}]*\}\s*\)\.fill\()['"][^'"]*['"]/,
    '\1process.env.TEST_USERNAME'
  )
  normalized = normalized.gsub(
    /(getBy(?:Label|Placeholder)\(['"](?:email|Email|username|Username|user|User)['"]\)\.fill\()['"][^'"]*['"]/,
    '\1process.env.TEST_USERNAME'
  )

  # 3. Replace password fields with process.env.TEST_PASSWORD
  normalized = normalized.gsub(
    /(getByRole\(['"]textbox['"],\s*\{\s*name:\s*['"](?:password|Password|passwd|Passwd)['"'][^}]*\}\s*\)\.fill\()['"][^'"]*['"]/,
    '\1process.env.TEST_PASSWORD'
  )
  normalized = normalized.gsub(
    /(getBy(?:Label|Placeholder)\(['"](?:password|Password|passwd|Passwd)['"]\)\.fill\()['"][^'"]*['"]/,
    '\1process.env.TEST_PASSWORD'
  )

  # 4. Replace phone number
  normalized = normalized.gsub(
    /(getBy(?:Role|Label|Placeholder)\([^)]*['"](?:phone|Phone|mobile|Mobile|tel|Tel)['"'][^)]*\)\.fill\()['"][^'"]*['"]/,
    '\1process.env.TEST_PHONE'
  )

  # 5. Replace OTP / verification code
  normalized = normalized.gsub(
    /(getBy(?:Role|Label|Placeholder)\([^)]*['"](?:otp|OTP|code|Code|verification|Verification)['"'][^)]*\)\.fill\()['"][^'"]*['"]/,
    '\1process.env.TEST_OTP'
  )

  # 6. Replace credit card
  normalized = normalized.gsub(
    /(getBy(?:Role|Label|Placeholder)\([^)]*['"](?:card|Card|credit|Credit|cvv|CVV)['"'][^)]*\)\.fill\()['"][^'"]*['"]/,
    '\1process.env.TEST_CARD'
  )

  # Save normalized content to DB
  if script_id.present?
    script = Script.find_by(id: script_id)
    if script
      script.update!(normalized_content: normalized)
    end
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

  def update_vnc_url
  test = Test.find(params[:id])
  test.update!(vnc_url: params[:vnc_url])
  render json: { success: true }
rescue => e
  render json: { error: e.message }, status: 422
 end
  
end