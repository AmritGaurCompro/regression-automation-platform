class Api::TestRunsController < ApplicationController
  def create
    title = params[:title]
    return render json: { error: 'Title missing' }, status: :bad_request if title.blank?

    node_path = `which node`.strip
    return render json: { error: 'Node not found' }, status: :internal_server_error if node_path.blank?

    script_path = Rails.root.join('automation/run.js')
    return render json: { error: 'run.js not found' }, status: :internal_server_error unless File.exist?(script_path)

    command = "#{node_path} #{script_path} #{title}.spec.js 2>&1"

    Rails.logger.info("Executing test: #{command}")

    output = ""
    IO.popen(command) do |io|
      io.each do |line|
        puts line        
        output += line   
      end
    end
    
    if output =~ /---RESULT---(.*?)---END---/m
      json_string = $1.strip
      results = JSON.parse(json_string)
            
      render json: {
        title: title,
        status: results['success'] ? 'completed' : 'failed',
        results: results
      }
    else
      render json: { 
        error: 'Could not parse test results'
      }, status: :internal_server_error
    end
  rescue JSON::ParserError => e
    Rails.logger.error("JSON Parse Error: #{e.message}")
    render json: { error: 'Failed to parse results' }, status: :internal_server_error
  end
end