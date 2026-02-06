class RunPlaywrightJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)
    test = test_run.test

    node_path = `which node`.strip
    script_path = Rails.root.join('automation/run.js')
    spec_name = "#{test.title}.spec.js"

    command = "#{node_path} #{script_path} #{spec_name} 2>&1"

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
  rescue => e
    test_run.update!(status: "failed") if test_run
    Rails.logger.error(e.message)
  end
end
