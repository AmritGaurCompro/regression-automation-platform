Rails.application.routes.draw do
  namespace :api do
    resources :record_tests, only: [:index, :create]
    resources :import_tests, only: [:create]

    # Dedicated CSRF-free callback endpoints for GitHub Actions
    post 'record_callbacks/:test_id/script_content', to: 'record_callbacks#script_content'
    post 'record_callbacks/:test_id/vnc_url',        to: 'record_callbacks#update_vnc_url'

    resources :tests do
      member do
        post 'vnc_url', to: 'tests#update_vnc_url'  # keep for run flow
      end
      resources :test_runs, only: [:index, :create, :show] do
        member do
          post 'artifacts', to: 'test_runs#receive_artifacts'
          post 'vnc_url',   to: 'test_runs#update_vnc_url'
        end
      end
    end
  end
end