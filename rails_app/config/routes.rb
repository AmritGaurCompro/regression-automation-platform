Rails.application.routes.draw do
  namespace :api do
    resources :test_runs, only: [:create]
    post 'test/:id', to: 'test_runs#create'
  end
end

