class Api::RecordTestsController < ActionController::API

  def create
    title = params[:title]
    test_id = params[:test_id]
    return render json: { error: 'Title missing' }, status: :bad_request if title.blank?

    file_name = title.ends_with?('.spec.js') ? title : "#{title}.spec.js"

    response = HTTParty.post(
      "https://api.github.com/repos/AmritGaurCompro/regression-automation-platform/actions/workflows/record.yml/dispatches",
      headers: {
        "Authorization" => "Bearer #{ENV['GITHUB_PAT']}",
        "Accept" => "application/vnd.github.v3+json",
        "Content-Type" => "application/json"
      },
      body: {
        ref: "QA2.0",
        inputs: {
          file_name: file_name,
          branch: "QA2.0",
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
