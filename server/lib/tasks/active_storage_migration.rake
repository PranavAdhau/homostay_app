require "stringio"

namespace :active_storage do
  desc "Copy existing Active Storage blobs from a source service into the current production service"
  task migrate_existing_blobs: :environment do
    target_service_name = Infrastructure::ActiveStorageConfig.service_name.to_s
    source_service_name = ENV.fetch("SOURCE_STORAGE_SERVICE", "local")

    if source_service_name == target_service_name
      abort "SOURCE_STORAGE_SERVICE must differ from the target service (#{target_service_name})."
    end

    service_configurations = Rails.configuration.active_storage.service_configurations
    source_service = ActiveStorage::Service.configure(source_service_name.to_sym, service_configurations)
    target_service = ActiveStorage::Blob.service

    copied = 0
    skipped = 0
    missing = 0

    ActiveStorage::Blob.find_each do |blob|
      if target_service.exist?(blob.key)
        skipped += 1
        next
      end

      unless source_service.exist?(blob.key)
        missing += 1
        warn "Missing source file for blob ##{blob.id} (key=#{blob.key})"
        next
      end

      io = StringIO.new(source_service.download(blob.key))
      target_service.upload(blob.key, io, checksum: blob.checksum, **blob.send(:service_metadata))
      copied += 1
    rescue StandardError => error
      warn "Failed to migrate blob ##{blob.id} (key=#{blob.key}): #{error.class}: #{error.message}"
      raise
    end

    puts "Copied #{copied} blobs, skipped #{skipped}, missing #{missing}."
  end
end
