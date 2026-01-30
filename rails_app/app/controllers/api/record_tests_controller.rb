class Api::RecordTestsController < ActionController::API
  def create
    title = params[:title]
    return render json: { error: 'Title missing' }, status: :bad_request if title.blank?

    file_name = title.ends_with?('.spec.js') ? title : "#{title}.spec.js"

    tests_dir = Rails.root.join('automation/tests')
    file_path = tests_dir.join(file_name)

    if File.exist?(file_path)
      return render json: { error: 'File name already exists' }, status: :conflict
    end

    node_path = `which node`.strip
    return render json: { error: 'Node not found' }, status: :internal_server_error if node_path.blank?

    script_path = Rails.root.join('automation/record.js')
    return render json: { error: 'record.js not found' }, status: :internal_server_error unless File.exist?(script_path)

    command = "#{node_path} #{script_path} record #{file_name}"

   pid = Process.spawn(
  command,
  chdir: Rails.root.join('automation').to_s
)
Process.detach(pid)

    render json: {
      file: file_name,
      status: 'recording_started'
    }
  end
end
