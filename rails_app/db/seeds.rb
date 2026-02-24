# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Seeding database..."

# Create sample tests
Test.create!([
  {
    name: 'Login Test',
    description: 'Tests user login functionality'
  },
  {
    name: 'Navigation Test',
    description: 'Tests navigation between pages'
  },
  {
    name: 'Redeem Code Test',
    description: 'Tests code redemption feature'
  }
])

puts "✅ Created #{Test.count} tests"
puts "🎉 Seeding completed!"
