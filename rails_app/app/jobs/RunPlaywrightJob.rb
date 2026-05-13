require 'open3'

class RunPlaywrightJob < ApplicationJob
  queue_as :default

  LOCAL_RUN_TIMEOUT_SECONDS = 8.minutes.to_i

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)

    case runner_mode_context(test_run)
    when :github_headed
      trigger_github_actions(test_run)
    when :local_headed
      run_locally(test_run, headed: true)
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

  def runner_mode_context(test_run)
    if test_run.runner_mode == 'headed'
      ENV['LOCAL_HEADED_OVERRIDE'] == 'true' ? :local_headed : :github_headed
    else
      :local_headless
    end
  end

  def trigger_github_actions(test_run)
    test = test_run.test
    spec_name = resolved_spec_name_for(test)

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
          ref: "QA4.0",
          inputs: {
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
    script_path = Rails.root.join('automation/run.js').to_s
    spec_name = ensure_spec_file_for_local_run!(test)

    puts "=== RUN LOCALLY (headed: #{headed}) ==="
    puts "Running Playwright locally with spec: #{spec_name}"
    $stdout.flush

    if node_path.blank?
      raise "Node not found in PATH"
    end

    env_vars = {
      'PW_RETRIES'  => test_run.retries_on_failure.to_s,
      'PW_HEADED'   => headed ? 'true' : 'false',
      'TEST_RUN_ID' => test_run.id.to_s,
      'ENVIRONMENT' => test_run.environment.to_s
    }

    puts "Running command: #{node_path} #{script_path} #{spec_name}"
    $stdout.flush

    output, timed_out = run_playwright_command(env_vars, node_path, script_path, spec_name)

    if output =~ /---RESULT---(.*?)---END---/m
      result = JSON.parse($1)
      test_run.update!(
        status: result["success"] ? "passed" : "failed",
        finished_at: Time.current
      )
    else
      test_run.update!(status: "failed", finished_at: Time.current)
    end

    Rails.logger.error("RunPlaywrightJob timeout for test_run=#{test_run.id}") if timed_out

    UploadArtifactsJob.perform_later(test_run.id)
  end

  def run_playwright_command(env_vars, node_path, script_path, spec_name)
    output = +""
    timed_out = false

    Open3.popen2e(env_vars, node_path, script_path, spec_name, chdir: Rails.root.join('automation').to_s, pgroup: true) do |_stdin, stdout_and_stderr, wait_thr|
      reader = Thread.new do
        stdout_and_stderr.each do |line|
          output << line
          $stdout.write(line)
          $stdout.flush
        end
      end

      unless wait_thr.join(LOCAL_RUN_TIMEOUT_SECONDS)
        timed_out = true
        output << "\n---RESULT---\n"
        output << {
          runId: env_vars['TEST_RUN_ID'],
          success: false,
          exitCode: 124,
          error: "Playwright execution timed out after #{LOCAL_RUN_TIMEOUT_SECONDS} seconds"
        }.to_json
        output << "\n---END---\n"

        safely_terminate_process_group(wait_thr.pid)
      end

      reader.join
    end

    [output, timed_out]
  end

  def safely_terminate_process_group(pid)
    Process.kill('TERM', -pid)
    sleep 1
    Process.kill('KILL', -pid)
  rescue Errno::ESRCH, Errno::EPERM
    nil
  end

  def resolved_spec_name_for(test)
    name = test.script&.name.presence || "#{test.title}.spec.js"
    base = File.basename(name)
    base.ends_with?('.spec.js') ? base : "#{base}.spec.js"
  end

  def ensure_spec_file_for_local_run!(test)
    spec_name = resolved_spec_name_for(test)
    script_content = test.script&.raw_content.presence || test.script&.normalized_content

    raise "Script content is missing for test ##{test.id}" if script_content.blank?

    tests_dir = Rails.root.join('automation', 'tests')
    FileUtils.mkdir_p(tests_dir)
    file_path = tests_dir.join(spec_name)

    should_write = !File.exist?(file_path) || File.read(file_path) != script_content
    if should_write
      File.write(file_path, script_content)
      Rails.logger.info("RunPlaywrightJob: synced spec file #{spec_name} from DB")
    end

    spec_name
  end
end