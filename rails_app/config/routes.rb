Rails.application.routes.draw do
  namespace :api do
    resources :record_tests, only: [:index, :create]
    resources :tests do
      resources :test_runs, only: [:index, :create, :show] do
        post 'artifacts', to: 'test_runs#receive_artifacts', on: :member
      end
    end
  end
end
