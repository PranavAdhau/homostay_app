module Whatsapp
  class PhoneNumberNormalizer
    class << self
      def normalize(value)
        digits = value.to_s.gsub(/\D/, "")
        return if digits.blank?

        digits.sub(/\A00/, "")
      end
    end
  end
end
