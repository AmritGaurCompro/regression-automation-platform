class UploadArtifactsJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)
    artifacts_root = Rails.root.join("automation/artifacts")
    run_folder = artifacts_root.join("run-#{test_run.id}")

    return unless Dir.exist?(run_folder)

    result_json_path = run_folder.join("result.json")
    return unless File.exist?(result_json_path)

    data = JSON.parse(File.read(result_json_path))

    results = data.dig("suites", 0, "specs", 0, "tests", 0, "results") || []
    failed_result = results.find { |r| r["errors"]&.any? }

    unless failed_result
      Rails.logger.info("No errors found, skipping artifact upload")
      return
    end

    Artifact.create!(
      test_run: test_run,
      kind: "error_log",
      file_url: nil,
      metadata: failed_result["errors"]
    )

    attachments = failed_result["attachments"] || []

    attachments.each do |att|
      next if att["name"] == "error-context"

      attachment_path = att["path"].to_s
      next if attachment_path.blank? || !File.exist?(attachment_path)

      url = CloudinaryUploadService.upload_file(attachment_path, folder: Rails.env)
      next unless url

      Artifact.create!(
        test_run: test_run,
        kind: att["name"],
        file_url: url
      )
    end

  rescue => e
    Rails.logger.error("UploadArtifactsJob failed: #{e.message}")

  ensure
    cleanup_artifacts_folder(test_run.id)
  end

  private

  def cleanup_artifacts_folder(test_run_id)
    run_folder = Rails.root.join("automation/artifacts", "run-#{test_run_id}")
    FileUtils.rm_rf(run_folder) if Dir.exist?(run_folder)
  end
end
