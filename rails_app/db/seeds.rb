# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Seeding database..."

# Create scripts first (Tests require scripts)
scripts = Script.create!([
  {
    name: 'login.spec.js',
    raw_content: 'test("login test", async () => { /* test code */ });',
    normalized_content: 'test("login test", async () => { /* test code */ });',
    language: 'javascript'
  },
  {
    name: 'navigation.spec.js',
    raw_content: 'test("navigation test", async () => { /* test code */ });',
    normalized_content: 'test("navigation test", async () => { /* test code */ });',
    language: 'javascript'
  },
  {
    name: 'redeem_code.spec.js',
    raw_content: 'test("redeem code test", async () => { /* test code */ });',
    normalized_content: 'test("redeem code test", async () => { /* test code */ });',
    language: 'javascript'
  }
])

puts "✅ Created #{Script.count} scripts"

# Create tests linked to scripts
Test.create!([
  {
    title: 'Login Test',
    script: scripts[0]
  },
  {
    title: 'Navigation Test',
    script: scripts[1]
  },
  {
    title: 'Redeem Code Test',
    script: scripts[2]
  }
])

puts "✅ Created #{Test.count} tests"
puts "🎉 Seeding completed!"
