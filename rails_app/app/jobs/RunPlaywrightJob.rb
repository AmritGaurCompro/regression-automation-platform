class RunPlaywrightJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)
    test = test_run.test
    
    node_path = `which node`.strip
    script_path = Rails.root.join('automation/run.js')
    spec_name = "#{test.title}.spec.js"
    
    # Build environment variables
    env_vars = {
      'PW_RETRIES' => test_run.retries_on_failure.to_s,
      'PW_HEADED' => (test_run.runner_mode == 'headed').to_s,
      'TEST_RUN_ID' => test_run.id.to_s,
      'ENVIRONMENT' => test_run.environment.to_s
    }
    
    # Build command with environment variables
    env_string = env_vars.map { |k, v| "#{k}=#{v}" }.join(' ')
    command = "#{env_string} #{node_path} #{script_path} #{spec_name} 2>&1"
    
    Rails.logger.info("Running Playwright: #{command}")
    
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
    
  rescue => e
    test_run.update!(status: "failed", finished_at: Time.current) if test_run
    Rails.logger.error("Playwright job failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
  end
end