require "openssl"

module Whatsapp
  class WebhookVerifier
    SIGNATURE_PREFIX = "sha256=".freeze

    class << self
      def verify_token?(verify_token)
        secure_compare(verify_token.to_s, ENV["WHATSAPP_WEBHOOK_VERIFY_TOKEN"].to_s)
      end

      def valid_signature?(raw_body:, signature:)
        return false if raw_body.blank? || signature.blank? || app_secret.blank?
        return false unless signature.start_with?(SIGNATURE_PREFIX)

        expected_signature = SIGNATURE_PREFIX + OpenSSL::HMAC.hexdigest("SHA256", app_secret, raw_body)
        secure_compare(signature, expected_signature)
      end

      private

      def app_secret
        ENV["WHATSAPP_APP_SECRET"].to_s
      end

      def secure_compare(left, right)
        return false if left.blank? || right.blank? || left.bytesize != right.bytesize

        ActiveSupport::SecurityUtils.secure_compare(left, right)
      end
    end
  end
end
