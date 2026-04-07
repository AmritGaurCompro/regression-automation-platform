class RunPlaywrightJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)
    if test_run.runner_mode == 'headed'
      if Rails.env.production?
        trigger_github_actions(test_run)
      else
        run_locally(test_run, headed: true)
      end
    else
      run_locally(test_run, headed: false)
    end
  rescue => e
    test_run.update!(status: "failed", finished_at: Time.current) if test_run
    puts "Playwright job failed: #{e.message}"
    puts e.backtrace.join("\n")
    $stdout.flush
  end

  private

  def trigger_github_actions(test_run)
    test = test_run.test
    spec_name = "#{test.title}.spec.js"

    puts "=== TRIGGER GITHUB ACTIONS ==="
    puts "spec_name: #{spec_name}"
    puts "test_run_id: #{test_run.id}"
    puts "test_id: #{test.id}"
    puts "GITHUB_PAT present: #{ENV['GITHUB_PAT'].present?}"
    puts "GITHUB_PAT starts with: #{ENV['GITHUB_PAT']&.first(10)}"
    $stdout.flush

    begin
      response = HTTParty.post(
        "https://api.github.com/repos/AmritGaurCompro/regression-automation-platform/actions/workflows/run-headed.yml/dispatches",
        headers: {
          "Authorization" => "Bearer #{ENV['GITHUB_PAT']}",
          "Accept" => "application/vnd.github.v3+json",
          "Content-Type" => "application/json"
        },
        body: {
          ref: "QA2.0",
          inputs: {
            test_file: spec_name,
            environment: test_run.environment.to_s,
            retries: test_run.retries_on_failure.to_s,
            test_run_id: test_run.id.to_s,
            test_id: test.id.to_s
          }
        }.to_json,
        timeout: 10
      )

      puts "=== GITHUB ACTIONS RESPONSE ==="
      puts "response code: #{response.code}"
      puts "response body: #{response.body}"
      $stdout.flush

      if response.code == 204
        puts "GitHub Actions triggered successfully for test_run #{test_run.id}"
        $stdout.flush
        test_run.update!(status: "running")
      else
        puts "GitHub Actions trigger failed: #{response.body}"
        $stdout.flush
        test_run.update!(status: "failed", finished_at: Time.current)
      end
    rescue => e
      puts "=== HTTPARTY ERROR ==="
      puts e.message
      puts e.backtrace.join("\n")
      $stdout.flush
      test_run.update!(status: "failed", finished_at: Time.current)
    end
  end

  def run_locally(test_run, headed: false)
    test = test_run.test
    node_path = `which node`.strip
    script_path = Rails.root.join('automation/run.js')
    spec_name = "#{test.title}.spec.js"

    puts "=== RUN LOCALLY ==="
    puts "Running Playwright locally with spec: #{spec_name}"
    puts "Headed requested: #{headed}"
    $stdout.flush

    env_vars = {
      'PW_RETRIES' => test_run.retries_on_failure.to_s,
      'PW_HEADED' => headed ? 'true' : 'false',
      'TEST_RUN_ID' => test_run.id.to_s,
      'ENVIRONMENT' => test_run.environment.to_s
    }

    env_string = env_vars.map { |k, v| "#{k}=#{v}" }.join(' ')
    command = "#{env_string} #{node_path} #{script_path} #{spec_name} 2>&1"

    puts "Running command: #{command}"
    $stdout.flush

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
