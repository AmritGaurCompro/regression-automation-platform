class Api::RecordTestsController < ActionController::API

  def create
    title = params[:title]
    return render json: { error: 'Title missing' }, status: :bad_request if title.blank?

    file_name = title.ends_with?('.spec.js') ? title : "#{title}.spec.js"

    # ── File existence check ──────────────────────────────────────────────────
    if Rails.env.production? || Rails.env.staging?
      # On Render: can't access local filesystem, check GitHub repo instead
      if file_exists_in_repo?(file_name)
        return render json: { error: 'File name already exists' }, status: :conflict
      end
    else
      # Local: your original check — unchanged
      tests_dir = Rails.root.join('automation/tests')
      file_path = tests_dir.join(file_name)
      if File.exist?(file_path)
        return render json: { error: 'File name already exists' }, status: :conflict
      end
    end

    # ── Trigger recording ─────────────────────────────────────────────────────
    if Rails.env.production? || Rails.env.staging?
      # On Render: trigger GitHub Actions record.yml workflow
      result = trigger_github_actions(file_name)

      unless result[:success]
        return render json: { error: result[:error] }, status: :internal_server_error
      end

      render json: {
        file:         file_name,
        status:       'recording_started',
        message:      'Recording started on GitHub Actions. Open the workflow run to get your VNC URL.',
        workflow_url: result[:workflow_url]
      }
    else
      # Local: your original flow — completely unchanged
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
        file:   file_name,
        status: 'recording_started'
      }
    end
  end

  def index
    tests_dir = Rails.root.join('automation/tests')

    files = Dir.glob(tests_dir.join('*.spec.js')).map do |file|
      { name: File.basename(file), path: file }
    end

    render json: files
  end

  private

  # ── Triggers record.yml on GitHub Actions ────────────────────────────────
  # All values come from Render environment variables — nothing hardcoded
  def trigger_github_actions(file_name)
    require 'net/http'
    require 'json'

    repo   = ENV['GITHUB_REPO']           # e.g. "yourname/yourrepo"   ← set on Render
    token  = ENV['GITHUB_PAT']            # Personal Access Token       ← set on Render
    branch = ENV['GITHUB_BRANCH'] || 'QA' # branch to record on        ← set on Render

    if repo.blank? || token.blank?
      return { success: false, error: 'GITHUB_REPO or GITHUB_PAT env vars missing on Render' }
    end

    uri              = URI("https://api.github.com/repos/#{repo}/actions/workflows/record.yml/dispatches")
    http             = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl     = true

    request                  = Net::HTTP::Post.new(uri)
    request['Authorization'] = "Bearer #{token}"
    request['Accept']        = 'application/vnd.github+json'
    request['Content-Type']  = 'application/json'

    request.body = {
      ref:    branch,
      inputs: {
        file_name: file_name,
        branch:    branch
      }
    }.to_json

    response = http.request(request)

    if response.code == '204'  # GitHub returns 204 on success, not 200
      {
        success:      true,
        workflow_url: "https://github.com/#{repo}/actions/workflows/record.yml"
      }
    else
      {
        success: false,
        error:   "GitHub Actions trigger failed: #{response.code} — #{response.body}"
      }
    end

  rescue => e
    { success: false, error: e.message }
  end

  # ── Checks if file already exists in GitHub repo ─────────────────────────
  # Replaces the local File.exist? check when running on Render
  def file_exists_in_repo?(file_name)
    require 'net/http'

    repo   = ENV['GITHUB_REPO']
    token  = ENV['GITHUB_PAT']
    branch = ENV['GITHUB_BRANCH'] || 'QA'

    return false if repo.blank? || token.blank?

    # GitHub Contents API — returns 200 if file exists, 404 if not
    path = "rails_app/automation/tests/#{file_name}"
    uri  = URI("https://api.github.com/repos/#{repo}/contents/#{path}?ref=#{branch}")

    http             = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl     = true

    request                  = Net::HTTP::Get.new(uri)
    request['Authorization'] = "Bearer #{token}"
    request['Accept']        = 'application/vnd.github+json'

    response = http.request(request)
    response.code == '200'

  rescue
    false  # if check fails, allow creation to proceed safely
  end

end
