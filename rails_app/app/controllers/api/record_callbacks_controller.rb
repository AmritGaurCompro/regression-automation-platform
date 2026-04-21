class Api::RecordCallbacksController < ActionController::API
  def script_content
    test    = Test.find(params[:test_id])
    script  = test.script
    content = params[:content].to_s

    Rails.logger.info("=== SCRIPT CONTENT CALLBACK ===")
    Rails.logger.info("test_id: #{test.id}, script: #{script&.id}, content_length: #{content.length}")

    return render json: { error: 'Content missing' },                     status: :bad_request          if content.blank?
    return render json: { error: 'No script associated with this test' }, status: :unprocessable_entity unless script

    tests_dir = Rails.root.join('automation', 'tests')
    FileUtils.mkdir_p(tests_dir)
    file_path = tests_dir.join(script.name)

    File.write(file_path, content)
    Rails.logger.info("Written to disk: #{file_path}, size: #{File.size(file_path)}")

    script.update!(raw_content: content, normalized_content: content)
    Rails.logger.info("DB updated for script ##{script.id}")

    test.update!(vnc_url: nil)

    render json: { status: 'saved', file: script.name }, status: :ok

  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Test not found' }, status: :not_found
  rescue => e
    Rails.logger.error("script_content callback failed: #{e.message}\n#{e.backtrace.join("\n")}")
    render json: { error: e.message }, status: :internal_server_error
  end

  def update_vnc_url
    test = Test.find(params[:test_id])
    test.update!(vnc_url: params[:vnc_url])
    Rails.logger.info("VNC URL updated for test ##{test.id}: #{params[:vnc_url].inspect}")
    render json: { success: true }, status: :ok

  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Test not found' }, status: :not_found
  rescue => e
    render json: { error: e.message }, status: :internal_server_error
  end
end