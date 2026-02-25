class RunPlaywrightJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)
    test     = test_run.test

    if Rails.env.production? || Rails.env.staging?
      run_via_github_actions(test_run, test)
    else
      run_locally(test_run, test)
    end

  rescue => e
    test_run.update!(status: "failed", finished_at: Time.current) if test_run
    Rails.logger.error("RunPlaywrightJob failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
  end

  private

  # ── LOCAL FLOW — completely unchanged from your original ──────────────────
  def run_locally(test_run, test)
    node_path   = `which node`.strip
    script_path = Rails.root.join('automation/run.js')
    spec_name   = "#{test.title}.spec.js"

    env_vars = {
      'PW_RETRIES'   => test_run.retries_on_failure.to_s,
      'PW_HEADED'    => (test_run.runner_mode == 'headed').to_s,
      'TEST_RUN_ID'  => test_run.id.to_s,
      'ENVIRONMENT'  => test_run.environment.to_s
    }

    env_string = env_vars.map { |k, v| "#{k}=#{v}" }.join(' ')
    command    = "#{env_string} #{node_path} #{script_path} #{spec_name} 2>&1"

    Rails.logger.info("Running Playwright locally: #{command}")

    output = ""
    IO.popen(command) { |io| io.each { |line| output << line } }

    if output =~ /---RESULT---(.*?)---END---/m
      result = JSON.parse($1)
      test_run.update!(
        status:      result["success"] ? "passed" : "failed",
        finished_at: Time.current
      )
    else
      test_run.update!(status: "failed", finished_at: Time.current)
    end

    UploadArtifactsJob.perform_later(test_run.id)
  end

  # ── DEPLOYED FLOW — triggers GitHub Actions workflow ─────────────────────
  def run_via_github_actions(test_run, test)
    require 'net/http'
    require 'json'

    repo      = ENV['GITHUB_REPO']
    token     = ENV['GITHUB_PAT']
    branch    = ENV['GITHUB_BRANCH'] || 'QA'
    spec_name = "#{test.title}.spec.js"

    # Pick workflow based on runner_mode chosen by user in UI
    workflow = test_run.runner_mode == 'headed' ? 'run-headed.yml' : 'run-headless.yml'

    Rails.logger.info("Triggering GitHub Actions: #{workflow} for #{spec_name}")

    uri              = URI("https://api.github.com/repos/#{repo}/actions/workflows/#{workflow}/dispatches")
    http             = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl     = true

    request                  = Net::HTTP::Post.new(uri)
    request['Authorization'] = "Bearer #{token}"
    request['Accept']        = 'application/vnd.github+json'
    request['Content-Type']  = 'application/json'

    request.body = {
      ref: branch,
      inputs: {
        test_file:   spec_name,
        environment: test_run.environment.to_s,
        retries:     test_run.retries_on_failure.to_s
      }
    }.to_json

    response = http.request(request)

    if response.code == '204'  # GitHub returns 204 on success
      Rails.logger.info("GitHub Actions triggered successfully for test_run ##{test_run.id}")
      # Status stays "running" — GH Actions will call webhook to update it when done
      # test_run status updated via POST /api/artifacts/webhook or a separate status webhook
    else
      Rails.logger.error("GitHub Actions trigger failed: #{response.code} #{response.body}")
      test_run.update!(status: "failed", finished_at: Time.current)
    end

  rescue => e
    Rails.logger.error("GitHub Actions trigger error: #{e.message}")
    test_run.update!(status: "failed", finished_at: Time.current)
    raise
  end
end
