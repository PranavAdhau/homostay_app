require "test_helper"
require Rails.root.join("lib/infrastructure/active_storage_config")

class Infrastructure::ActiveStorageConfigTest < ActiveSupport::TestCase
  test "defaults to local without object storage configuration" do
    result = with_env({}) { Infrastructure::ActiveStorageConfig.service_name }
    assert_equal :local, result
  end

  test "uses s3 when explicitly configured" do
    result = with_env("ACTIVE_STORAGE_SERVICE" => "s3") do
      Infrastructure::ActiveStorageConfig.service_name
    end
    assert_equal :s3, result
  end

  test "uses s3 when railway bucket variables are present" do
    result = with_env(
      "BUCKET" => "bucket-name",
      "ACCESS_KEY_ID" => "access-key",
      "SECRET_ACCESS_KEY" => "secret-key",
      "ENDPOINT" => "https://storage.railway.app"
    ) do
      Infrastructure::ActiveStorageConfig.service_name
    end
    assert_equal :s3, result
  end

  test "uses s3 when aws-prefixed variables are present" do
    result = with_env(
      "AWS_S3_BUCKET_NAME" => "bucket-name",
      "AWS_ACCESS_KEY_ID" => "access-key",
      "AWS_SECRET_ACCESS_KEY" => "secret-key",
      "AWS_ENDPOINT_URL" => "https://storage.railway.app"
    ) do
      Infrastructure::ActiveStorageConfig.service_name
    end
    assert_equal :s3, result
  end

  private

  def with_env(overrides)
    keys = %w[
      ACTIVE_STORAGE_SERVICE
      ACTIVE_STORAGE_BUCKET ACTIVE_STORAGE_ACCESS_KEY_ID ACTIVE_STORAGE_SECRET_ACCESS_KEY ACTIVE_STORAGE_ENDPOINT
      BUCKET ACCESS_KEY_ID SECRET_ACCESS_KEY ENDPOINT
      AWS_S3_BUCKET_NAME AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_ENDPOINT_URL
    ]
    original = keys.to_h { |key| [key, ENV[key]] }
    keys.each { |key| ENV.delete(key) }
    overrides.each { |key, value| ENV[key] = value }
    yield
  ensure
    keys.each do |key|
      if original[key].nil?
        ENV.delete(key)
      else
        ENV[key] = original[key]
      end
    end
  end
end
