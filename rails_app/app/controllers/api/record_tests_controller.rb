class Api::RecordTestsController < ActionController::API

  def create
    title = params[:title]
    test_id = params[:test_id]
    return render json: { error: 'Title missing' }, status: :bad_request if title.blank?

    file_name = title.ends_with?('.spec.js') ? title : "#{title}.spec.js"
    test_title = file_name.sub('.spec.js', '')
    tests_dir = Rails.root.join('automation/tests')
    file_path = tests_dir.join(file_name)

    return render json: { error: 'File already exists on disk' }, status: :conflict if File.exist?(file_path)
    return render json: { error: 'Test already exists in database' }, status: :conflict if Test.exists?(title: test_title)

    node_path = `which node`.strip
    return render json: { error: 'Node not found' }, status: :internal_server_error if node_path.blank?

    script_path = Rails.root.join('automation/record.js')
    return render json: { error: 'record.js not found' }, status: :internal_server_error unless File.exist?(script_path)

    script = Script.create!(
      name: file_name,
      raw_content: nil,
      normalized_content: nil,
      language: 'javascript'
    )

    new_record = Test.create!(
      title: test_title,
      script_id: script.id
    )

    command = "#{node_path} #{script_path} record #{file_name}"
    pid = Process.spawn(command, chdir: Rails.root.join('automation').to_s)
    Process.detach(pid)

    script_id = script.id

    Thread.new do
      begin
        Process.wait(pid)
      rescue Errno::ECHILD
      end

      sleep 2

      if File.exist?(file_path) && File.size(file_path) > 0
        begin
          raw = File.read(file_path)
          Script.find(script_id).update!(
            raw_content: raw,
            normalized_content: raw
          )
          Rails.logger.info("Script synced after process exit: #{file_name}")
        rescue => e
          Rails.logger.error("Failed to sync script #{file_name}: #{e.message}")
        end
      else
        Rails.logger.warn("File missing or empty after process exit: #{file_name}")
      end
    end

    render json: {
      file: file_name,
      status: 'recording_started',
      new_test: { id: new_record.id, title: test_title, status: 'NEW' }
    }

    response = HTTParty.post(
      "https://api.github.com/repos/AmritGaurCompro/regression-automation-platform/actions/workflows/record.yml/dispatches",
      headers: {
        "Authorization" => "Bearer #{ENV['GITHUB_PAT']}",
        "Accept" => "application/vnd.github.v3+json",
        "Content-Type" => "application/json"
      },
      body: {
        ref: "QA3.0",
        inputs: {
          file_name: file_name,
          branch: "QA3.0",
          test_id: test_id.to_s
        }
      }.to_json,
      timeout: 10
    )

    if response.code == 204
      render json: {
        file: file_name,
        status: 'recording_started'
      }
    else
      render json: { error: "Failed to trigger workflow: #{response.body}" }, status: :unprocessable_entity
    end

  rescue => e
    render json: { error: e.message }, status: :internal_server_error
  end

  def index
    tests_dir = Rails.root.join('automation/tests')
    files = Dir.glob(tests_dir.join('*.spec.js')).map do |file|
      { name: File.basename(file), path: file }
    end
    render json: files
  end

end