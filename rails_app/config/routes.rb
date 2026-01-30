Rails.application.routes.draw do
  namespace :api do
    resources :test_runs, only: [:create]
    post 'test/:id', to: 'test_runs#create'
    resources :record_tests, only: [:create]
  end
end

