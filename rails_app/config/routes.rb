Rails.application.routes.draw do
  # Health check endpoint
  get '/health', to: 'health#check'
  
  namespace :api do
    resources :record_tests, only: [:index,:create]
    resources :tests do
      resources :test_runs, only: [:index, :create, :show]      
    end
  end
end