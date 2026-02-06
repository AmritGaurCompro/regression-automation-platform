Rails.application.routes.draw do
  namespace :api do
    resources :tests, only: [:index, :show] do
      resources :test_runs, only: [:create, :show]
    end
  end
end
  