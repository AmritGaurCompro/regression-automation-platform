Rails.application.routes.draw do
  namespace :api do
    resources :tests do
      resources :test_runs, only: [:index, :create, :show]
    end
    resources :record_tests, only: [:index, :create]
  end
end