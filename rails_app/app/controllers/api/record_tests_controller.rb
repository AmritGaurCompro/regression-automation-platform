class Api::RecordTestsController < ActionController::API
  def create
    title = params[:title].to_s.strip
    return render json: { error: 'Title missing' }, status: :bad_request if title.blank?

    file_name  = title.ends_with?('.spec.js') ? title : "#{title}.spec.js"
    test_title = file_name.delete_suffix('.spec.js')
    tests_dir  = Rails.root.join('automation/tests')
    file_path  = tests_dir.join(file_name)

    return render json: { error: 'File already exists on disk' },     status: :conflict if File.exist?(file_path)
    return render json: { error: 'Test already exists in database' }, status: :conflict if Test.exists?(title: test_title)

    script = Script.create!(
      name:               file_name,
      raw_content:        nil,
      normalized_content: nil,
      language:           'javascript'
    )
    test = Test.create!(title: test_title, script: script)

    if Rails.env.production?
      trigger_github_actions(test, script, file_name)
    else
      run_locally(test, script, file_name, file_path)
    end

  rescue => e
    render json: { error: e.message }, status: :internal_server_error
  end

  def index
    tests_dir = Rails.root.join('automation/tests')
    files = Dir.glob(tests_dir.join('*.spec.js')).map do |f|
      { name: File.basename(f), path: f }
    end
    render json: files
  end

  private

  def trigger_github_actions(test, script, file_name)
    response = HTTParty.post(
      "https://api.github.com/repos/AmritGaurCompro/regression-automation-platform/actions/workflows/record.yml/dispatches",
      headers: {
        "Authorization" => "Bearer #{ENV['GITHUB_PAT']}",
        "Accept"        => "application/vnd.github.v3+json",
        "Content-Type"  => "application/json"
      },
      body: {
        ref: "QA4.0",
        inputs: {
          file_name: file_name,
          test_id:   test.id.to_s
        }
      }.to_json,
      timeout: 10
    )

    unless response.code == 204
      test.destroy
      script.destroy
      return render json: { error: "Failed to trigger workflow: #{response.body}" },
                    status: :unprocessable_entity
    end

    render json: {
      file:     file_name,
      mode:     'headed',
      status:   'recording_started',
      new_test: { id: test.id, title: test.title, status: 'NEW' }
    }, status: :accepted
  end

  def run_locally(test, script, file_name, file_path)
    node_path   = `which node`.strip
    script_path = Rails.root.join('automation/record.js')

    unless node_path.present?
      test.destroy; script.destroy
      return render json: { error: 'Node not found' }, status: :internal_server_error
    end

    unless File.exist?(script_path)
      test.destroy; script.destroy
      return render json: { error: 'record.js not found' }, status: :internal_server_error
    end

    command = "TEST_ID=#{test.id} RAILS_URL=http://localhost:3000 #{node_path} #{script_path} record #{file_name}"
    pid = Process.spawn(command, chdir: Rails.root.join('automation').to_s)
    Process.detach(pid)

    render json: {
      file:     file_name,
      mode:     'local',
      status:   'recording_started',
      new_test: { id: test.id, title: test.title, status: 'NEW' }
    }, status: :accepted
  end
end