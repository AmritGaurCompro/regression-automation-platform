Rails.application.routes.draw do
  namespace :api do
    resources :record_tests, only: [:index, :create] do
      member do
        post 'vnc_url'
        post 'script_content'
      end
    end
    resources :import_tests, only: [:create]
    resources :tests do
      get 'script', to: 'tests#script', on: :member
      post 'vnc_url', to: 'tests#update_vnc_url', on: :member
      resources :test_runs, only: [:index, :create, :show] do
        post 'artifacts', to: 'test_runs#receive_artifacts', on: :member
        post 'vnc_url', to: 'test_runs#update_vnc_url', on: :member
      end
    end
  end
end