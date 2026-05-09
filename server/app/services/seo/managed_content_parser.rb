module Seo
  class ManagedContentParser
    class << self
      def extract(raw_params, reject_blog_id: nil, reject_homestay_id: nil)
        {
          seo_summary: raw_params[:seo_summary].to_s.strip.presence,
          locality_tags: parse_string_list(raw_params[:locality_tags_text]),
          nearby_landmark_tags: parse_string_list(raw_params[:nearby_landmark_tags_text]),

          related_blog_ids: parse_integer_list(
            raw_params[:related_blog_ids],
            reject_id: reject_blog_id,
          ),

          related_homestay_ids: parse_integer_list(
            raw_params[:related_homestay_ids],
            reject_id: reject_homestay_id,
          ),

          faq_entries: parse_faq_entries(raw_params[:faq_entries_text]),
        }.compact
      end

      def parse_string_list(value)
        Array(value)
          .flat_map { |item| item.to_s.split(/[\n,]/) }
          .map(&:strip)
          .reject(&:blank?)
          .uniq
      end

      def parse_integer_list(value, reject_id: nil)
        values =
          case value
          when ActionController::Parameters
            value.to_unsafe_h.values
          when Array
            value
          else
            Array.wrap(value)
          end

        values
          .flatten
          .filter_map do |item|
            parsed = Integer(item, 10)
            parsed if parsed.positive?
          rescue ArgumentError, TypeError
            nil
          end
          .reject do |item|
            reject_id.present? && item == reject_id.to_i
          end
          .uniq
      end

      def parse_faq_entries(value)
        value.to_s.lines.filter_map do |line|
          question, answer =
            line.split("|", 2).map { |item| item.to_s.strip }

          next if question.blank? || answer.blank?

          {
            "question" => question,
            "answer" => answer,
          }
        end
      end
    end
  end
end
