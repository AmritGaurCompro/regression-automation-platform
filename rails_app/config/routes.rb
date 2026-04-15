Rails.application.routes.draw do
  namespace :api do
    resources :record_tests, only: [:index, :create]
    resources :import_tests, only: [:create]
    resources :tests do
      member do
        post 'vnc_url',        to: 'tests#update_vnc_url'
        post 'script_content', to: 'tests#script_content'  # ← add this
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