ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "devise"
require "minitest"

# Ruby 3.3 currently exposes minitest 6 as the default gem in this environment.
# Rails 7.2 extends ActiveSupport::TestCase with a class-level `run(reporter,
# options = {})`, while minitest 6 expects `run(klass, method_name, reporter)`.
# Re-route test execution through minitest's current API so the suite can boot.
if ActiveSupport::TestCase.method(:run).arity != 3
  class << ActiveSupport::TestCase
    def run(klass, method_name, reporter)
      Minitest::Runnable.run(klass, method_name, reporter)
    end
  end
end

module ActiveSupport
  class TestCase
    include ActiveJob::TestHelper

    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end

class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end
