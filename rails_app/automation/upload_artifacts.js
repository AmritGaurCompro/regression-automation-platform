class RunPlaywrightJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)

    if test_run.runner_mode == 'headed'
      trigger_github_actions(test_run)
    else
      run_locally(test_run)
    end

  rescue => e
    test_run.update!(status: "failed", finished_at: Time.current) if test_run
    Rails.logger.error("Playwright job failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
  end

  private

  def trigger_github_actions(test_run)
    test = test_run.test
    spec_name = "#{test.title}.spec.js"

    response = HTTParty.post(
      "https://api.github.com/repos/AmritGaurCompro/regression-automation-platform/actions/workflows/run-headed.yml/dispatches",
      headers: {
        "Authorization" => "Bearer #{ENV['GITHUB_TOKEN']}",
        "Accept" => "application/vnd.github.v3+json",
        "Content-Type" => "application/json"
      },
      body: {
        ref: "QA",
        inputs: {
          test_file: spec_name,
          environment: test_run.environment.to_s,
          retries: test_run.retries_on_failure.to_s,
          test_run_id: test_run.id.to_s
        }
      }.to_json
    )

    if response.code == 204
      Rails.logger.info("GitHub Actions triggered for test_run #{test_run.id}")
      # Status will be updated when GitHub Actions calls back
      test_run.update!(status: "running")
    else
      Rails.logger.error("GitHub Actions trigger failed: #{response.body}")
      test_run.update!(status: "failed", finished_at: Time.current)
    end
  end

  def run_locally(test_run)
    test = test_run.test
    node_path = `which node`.strip
    script_path = Rails.root.join('automation/run.js')
    spec_name = "#{test.title}.spec.js"

    env_vars = {
      'PW_RETRIES' => test_run.retries_on_failure.to_s,
      'PW_HEADED' => 'false',
      'TEST_RUN_ID' => test_run.id.to_s,
      'ENVIRONMENT' => test_run.environment.to_s
    }

    env_string = env_vars.map { |k, v| "#{k}=#{v}" }.join(' ')
    command = "#{env_string} #{node_path} #{script_path} #{spec_name} 2>&1"

    Rails.logger.info("Running Playwright locally: #{command}")

    output = ""
    IO.popen(command) { |io| io.each { |line| output << line } }

    if output =~ /---RESULT---(.*?)---END---/m
      result = JSON.parse($1)
      test_run.update!(
        status: result["success"] ? "passed" : "failed",
        finished_at: Time.current
      )
    else
      test_run.update!(
        status: "failed",
        finished_at: Time.current
      )
    end

    UploadArtifactsJob.perform_later(test_run.id)
  end
end
