class UploadArtifactsJob < ApplicationJob
  queue_as :default

  def perform(test_run_id)
    test_run = TestRun.find(test_run_id)
    artifacts_root = Rails.root.join("automation/artifacts")

    return unless Dir.exist?(artifacts_root)

    latest_folder = Dir.children(artifacts_root)
                       .map { |f| [f, File.mtime(File.join(artifacts_root, f))] }
                       .max_by(&:last)&.first

    return unless latest_folder

    result_json_path = File.join(artifacts_root, latest_folder, "result.json")
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

      url = CloudinaryUploadService.upload_file(att["path"], folder: Rails.env)
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
    cleanup_artifacts_folder
  end

  private

  def cleanup_artifacts_folder
    artifacts_root = Rails.root.join("automation/artifacts")
    FileUtils.rm_rf(artifacts_root) if Dir.exist?(artifacts_root)
  end
end
