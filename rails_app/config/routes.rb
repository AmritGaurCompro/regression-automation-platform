Rails.application.routes.draw do
  namespace :api do
    resources :record_tests, only: [:index,:create]
    resources :import_tests, only: [:create]
    resources :tests do
      post 'vnc_url', to: 'tests#update_vnc_url', on: :member
      resources :test_runs, only: [:index, :create, :show] do
        post 'artifacts', to: 'test_runs#receive_artifacts', on: :member
        post 'vnc_url', to: 'test_runs#update_vnc_url', on: :member
      end
    end
  end
end