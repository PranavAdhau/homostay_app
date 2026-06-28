module Whatsapp
  class PhoneNumberNormalizer
    class << self
      def normalize(value)
        digits = value.to_s.gsub(/\D/, "")
        return if digits.blank?

        digits
      end
    end
  end
end
